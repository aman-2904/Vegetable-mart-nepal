"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Centralized security check for all admin actions
export async function verifyAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admins only" };
  }

  return { success: true, user };
}

// ----------------- DASHBOARD -----------------
export async function getDashboardStatsAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return null;

  const supabase = createClient();
  
  // Aggregate queries using count and sum where possible
  // Using multiple parallel promises for performance
  const [
    { data: revenueData },
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: lowStockProducts }
  ] = await Promise.all([
    supabase.from("orders").select("total, created_at").neq("order_status", "cancelled"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("products").select("name, stock, minimum_stock").lt("stock", "10").limit(5)
  ]);

  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = revenueData?.filter(o => new Date(o.created_at) >= today) || [];
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

  return {
    totalRevenue,
    todayRevenue,
    totalOrders: totalOrders || 0,
    todayOrdersCount: todayOrders.length,
    pendingOrders: pendingOrders || 0,
    totalCustomers: totalCustomers || 0,
    lowStockProducts: lowStockProducts || []
  };
}

// ----------------- CATEGORIES -----------------
export async function getAdminCategoriesAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function createCategoryAction(data: { name: string, slug: string, description?: string, image_url?: string }) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();
  const { error } = await supabase.from("categories").insert([data]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleCategoryStatusAction(id: string, is_active: boolean) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false };
  const supabase = createClient();
  await supabase.from("categories").update({ is_active }).eq("id", id);
  return { success: true };
}

// ----------------- PRODUCTS -----------------
export async function getAdminProductsAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();
  const { data } = await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false });
  return data || [];
}

export async function saveProductAction(data: any, id?: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();

  if (data.price < 0) return { success: false, error: "Price cannot be negative" };
  if (data.stock < 0) return { success: false, error: "Stock cannot be negative" };
  if (data.discount_price && data.discount_price >= data.price) {
    return { success: false, error: "Discount price must be lower than original price" };
  }

  if (id) {
    const { error } = await supabase.from("products").update(data).eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("products").insert([data]);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function toggleProductStatusAction(id: string, field: 'is_active' | 'is_featured', value: boolean) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false };
  const supabase = createClient();
  await supabase.from("products").update({ [field]: value }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop"); // Revalidate shop to reflect status changes
  return { success: true };
}

export async function deleteProductAction(id: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false };
  const supabase = createClient();
  
  // Note: Depending on foreign key constraints (like orders or inventory logs),
  // this might fail if the product has been ordered. 
  // It's usually better to soft-delete (set is_active = false).
  // But per requirement, we implement a hard delete.
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

// ----------------- INVENTORY -----------------
export async function updateInventoryAction(productId: string, newStock: number, reason: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();

  if (newStock < 0) return { success: false, error: "Stock cannot be negative" };

  const { data: product } = await supabase.from("products").select("stock").eq("id", productId).single();
  if (!product) return { success: false, error: "Product not found" };

  const previousStock = product.stock;
  const quantityChanged = newStock - previousStock;

  if (quantityChanged === 0) return { success: true };

  const { error: updateError } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
  if (updateError) return { success: false, error: updateError.message };

  await supabase.from("inventory_transactions").insert([{
    product_id: productId,
    previous_stock: previousStock,
    new_stock: newStock,
    quantity_changed: quantityChanged,
    change_type: "manual_adjustment",
    reason: reason,
    created_by: adminCheck.user!.id
  }]);

  return { success: true };
}

// ----------------- ORDERS -----------------
export async function getAdminOrdersAction(filters?: { status?: string, payment?: string }) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();

  let query = supabase
    .from("orders")
    .select("*, profile:profiles(full_name, phone), order_items(count)")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("order_status", filters.status);
  if (filters?.payment) query = query.eq("payment_status", filters.payment);

  const { data } = await query;
  return data || [];
}

export async function getAdminOrderDetailsAction(orderNumber: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return null;
  const supabase = createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, phone), addresses(*), order_items(*), payments(*)")
    .eq("order_number", orderNumber)
    .single();

  return data;
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({ order_status: newStatus })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ----------------- PAYMENTS -----------------
export async function getAdminPaymentsAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();

  const { data } = await supabase
    .from("payments")
    .select("*, order:orders(order_number, user_id, profile:profiles(full_name)), verified_by_profile:profiles!payments_verified_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  return data || [];
}

export async function updatePaymentStatusAction(paymentId: string, newStatus: string, orderId: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();

  // Determine verification details if verifying or rejecting
  const isVerifying = ['verified', 'rejected', 'collected'].includes(newStatus);
  const verifyPayload = isVerifying ? {
    verified_by: adminCheck.user!.id,
    verified_at: new Date().toISOString()
  } : {};

  const { error } = await supabase
    .from("payments")
    .update({ status: newStatus, ...verifyPayload })
    .eq("id", paymentId);

  if (error) return { success: false, error: error.message };

  // Sync to Orders table for convenience
  await supabase
    .from("orders")
    .update({ payment_status: newStatus })
    .eq("id", orderId);

  return { success: true };
}

// ----------------- CUSTOMERS -----------------
export async function getAdminCustomersAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();

  // In a real prod environment, you would use an RPC to aggregate this efficiently.
  // For sandbox, we fetch profiles and basic order stats.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, orders(id, total, created_at)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (!profiles) return [];

  return profiles.map(profile => {
    const totalSpent = profile.orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const lastOrder = profile.orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return {
      ...profile,
      orders_count: profile.orders.length,
      total_spent: totalSpent,
      last_order_date: lastOrder?.created_at || null
    };
  });
}

export async function getAdminCustomerDetailsAction(userId: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return null;
  const supabase = createClient();

  const [
    { data: profile },
    { data: addresses },
    { data: orders }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("addresses").select("*").eq("user_id", userId),
    supabase.from("orders").select("*, order_items(count)").eq("user_id", userId).order("created_at", { ascending: false })
  ]);

  return { profile, addresses, orders };
}

// ----------------- SETTINGS & BANNERS -----------------

export async function getAdminSettingsAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return null;
  const supabase = createClient();
  const { data } = await supabase.from("store_settings").select("*").single();
  return data;
}

export async function updateAdminSettingsAction(settings: any) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();
  
  const { error } = await supabase
    .from("store_settings")
    .update(settings)
    .eq("id", settings.id);
    
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminBannersAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();
  const { data } = await supabase.from("banners").select("*").order("display_order", { ascending: true });
  return data || [];
}

export async function saveBannerAction(data: any, id?: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();

  if (id) {
    const { error } = await supabase.from("banners").update(data).eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("banners").insert([data]);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function toggleBannerStatusAction(id: string, is_active: boolean) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false };
  const supabase = createClient();
  await supabase.from("banners").update({ is_active }).eq("id", id);
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false };
  const supabase = createClient();
  await supabase.from("banners").delete().eq("id", id);
  return { success: true };
}

export async function getAdminDeliveryAreasAction() {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return [];
  const supabase = createClient();
  const { data } = await supabase.from("delivery_areas").select("*").order("city", { ascending: true });
  return data || [];
}

export async function saveDeliveryAreaAction(data: any, id?: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false, error: adminCheck.error };
  const supabase = createClient();

  if (id) {
    const { error } = await supabase.from("delivery_areas").update(data).eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("delivery_areas").insert([data]);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteDeliveryAreaAction(id: string) {
  const adminCheck = await verifyAdminAccess();
  if (!adminCheck.success) return { success: false };
  const supabase = createClient();
  await supabase.from("delivery_areas").delete().eq("id", id);
  return { success: true };
}

