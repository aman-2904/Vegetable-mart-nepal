"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStoreSettingsAction() {
  const supabase = createClient();
  const { data, error } = await supabase.from("store_settings").select("*").limit(1).single();
  
  if (error || !data) {
    return {
      minimum_order_amount: 0,
      delivery_fee: 40,
      free_delivery_threshold: 500,
    };
  }
  
  return data;
}

export async function placeOrderAction(addressId: string, paymentMethod: 'qr' | 'cod') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "Not authenticated" };

  // Call the atomic RPC function
  const { data: orderNumber, error } = await supabase.rpc('place_order', {
    p_user_id: user.id,
    p_address_id: addressId,
    p_payment_method: paymentMethod
  });

  if (error) {
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to place order" };
  }

  return { success: true, orderNumber };
}

export async function getOrderDetailsAction(orderNumber: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), addresses(*), payments(*)")
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data;
}

export async function confirmQRPaymentAction(orderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  // Verify the order belongs to the user
  const { data: order } = await supabase.from("orders").select("id").eq("id", orderId).eq("user_id", user.id).single();
  if (!order) return { success: false };

  // Update payment status to submitted
  const { error } = await supabase.from("payments").update({ status: 'submitted' }).eq("order_id", orderId);
  if (error) return { success: false, error: error.message };

  return { success: true };
}
