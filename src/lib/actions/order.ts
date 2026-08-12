"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrdersAction(statusFilter?: 'active' | 'completed' | 'cancelled') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, orders: [] };

  let query = supabase
    .from("orders")
    .select("*, order_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (statusFilter === 'active') {
    query = query.in("order_status", ['pending', 'confirmed', 'preparing', 'out_for_delivery']);
  } else if (statusFilter === 'completed') {
    query = query.eq("order_status", 'delivered');
  } else if (statusFilter === 'cancelled') {
    query = query.eq("order_status", 'cancelled');
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch orders:", error);
    return { success: false, orders: [] };
  }

  return { success: true, orders: data };
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
