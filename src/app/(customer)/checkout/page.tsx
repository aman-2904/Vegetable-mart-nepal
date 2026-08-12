import { getAddressesAction } from "@/lib/actions/address";
import { getStoreSettingsAction } from "@/lib/actions/checkout";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login?next=/checkout");
  }

  const [{ addresses }, storeSettings, { data: deliveryAreas }] = await Promise.all([
    getAddressesAction(),
    getStoreSettingsAction(),
    createClient().from('delivery_areas').select('*').eq('is_active', true)
  ]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <CheckoutClient 
          initialAddresses={addresses || []} 
          storeSettings={storeSettings}
          deliveryAreas={deliveryAreas || []}
        />
      </div>
    </div>
  );
}
