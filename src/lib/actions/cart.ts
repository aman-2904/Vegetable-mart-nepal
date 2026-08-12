"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "../services/product.service";

export interface DbCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

// Ensure a user has a cart, create if not
async function getOrCreateCartId(supabase: any, userId: string): Promise<string | null> {
  let { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).single();
  
  if (!cart) {
    const { data: newCart, error } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
    if (error) return null;
    cart = newCart;
  }
  return cart.id;
}

export async function syncCartAction(localItems: { productId: string, quantity: number }[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, message: "Not authenticated" };

  const cartId = await getOrCreateCartId(supabase, user.id);
  if (!cartId) return { success: false, message: "Failed to access cart" };

  // Fetch existing items
  const { data: existingItems } = await supabase.from('cart_items').select('product_id, quantity').eq('cart_id', cartId);
  const existingMap = new Map(existingItems?.map((i: any) => [i.product_id, i.quantity]) || []);

  // Merge logic: For now, if item exists locally but not in DB, add it.
  // If it exists in both, keep DB quantity or max quantity? Let's just use the max to prevent data loss.
  for (const item of localItems) {
    const existingQuantity = existingMap.get(item.productId);
    
    if (existingQuantity) {
      const newQuantity = Math.max(existingQuantity, item.quantity);
      if (newQuantity !== existingQuantity) {
        await supabase.from('cart_items').update({ quantity: newQuantity }).eq('cart_id', cartId).eq('product_id', item.productId);
      }
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: item.productId,
        quantity: item.quantity
      });
    }
  }

  // Return the newly merged cart to hydrate client
  return await getDbCartAction();
}

export async function getDbCartAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, items: [] };

  const cartId = await getOrCreateCartId(supabase, user.id);
  if (!cartId) return { success: false, items: [] };

  const { data: items, error } = await supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('cart_id', cartId);

  if (error) return { success: false, error: error.message };

  // Format matching the local CartItem structure
  const formattedItems = (items || []).map(item => ({
    product: item.product,
    quantity: item.quantity
  }));

  return { success: true, items: formattedItems };
}

export async function updateDbCartItemAction(productId: string, quantity: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const cartId = await getOrCreateCartId(supabase, user.id);
  if (!cartId) return { success: false };

  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
  } else {
    // Check if exists
    const { data: existing } = await supabase.from('cart_items').select('id').eq('cart_id', cartId).eq('product_id', productId).single();
    if (existing) {
      await supabase.from('cart_items').update({ quantity }).eq('cart_id', cartId).eq('product_id', productId);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cartId, product_id: productId, quantity });
    }
  }

  return { success: true };
}

export async function removeDbCartItemAction(productId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const cartId = await getOrCreateCartId(supabase, user.id);
  if (!cartId) return { success: false };

  await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
  return { success: true };
}

export async function clearDbCartAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const cartId = await getOrCreateCartId(supabase, user.id);
  if (!cartId) return { success: false };

  await supabase.from('cart_items').delete().eq('cart_id', cartId);
  return { success: true };
}
