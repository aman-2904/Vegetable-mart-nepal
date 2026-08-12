"use server";

import { createClient } from "@/lib/supabase/server";

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  postal_code: string;
  landmark: string | null;
  is_default: boolean;
}

export async function getAddressesAction(): Promise<{ success: boolean; addresses?: Address[]; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, addresses: data as Address[] };
}

export async function createAddressAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const addressData = {
    user_id: user.id,
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    house: formData.get("house") as string,
    street: formData.get("street") as string,
    area: formData.get("area") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    postal_code: formData.get("postal_code") as string,
    landmark: (formData.get("landmark") as string) || null,
  };

  // Check if this is the first address, if so, make it default
  const { count } = await supabase.from("addresses").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
  const is_default = count === 0;

  const { error } = await supabase.from("addresses").insert({ ...addressData, is_default });
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function setDefaultAddressAction(addressId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Unset previous defaults
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  
  // Set new default
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", addressId).eq("user_id", user.id);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}
