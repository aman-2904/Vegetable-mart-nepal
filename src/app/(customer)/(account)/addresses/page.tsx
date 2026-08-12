import { getAddressesAction, deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/address";
import Link from "next/link";
import { Plus, MapPin, Trash2, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AddressesPage() {
  const { success, addresses } = await getAddressesAction();

  if (!success || !addresses) {
    return <div className="p-8 text-center text-red-500">Failed to load addresses or you are not logged in.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
            <p className="text-gray-500 mt-2">Manage your delivery addresses</p>
          </div>
          <Link 
            href="/addresses/new" 
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" /> Add New
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No addresses found</h3>
            <p className="text-gray-500 mb-6">You haven't saved any delivery addresses yet.</p>
            <Link 
              href="/addresses/new"
              className="inline-flex bg-green-50 text-green-700 px-6 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
            >
              Add your first address
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className={`bg-white rounded-2xl border p-6 shadow-sm relative ${address.is_default ? 'border-green-200 ring-1 ring-green-200' : 'border-gray-200'}`}>
                {address.is_default && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </div>
                )}
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{address.full_name}</h3>
                <p className="text-gray-600 font-medium mb-4">{address.phone}</p>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {address.house}, {address.street}<br/>
                  {address.area}, {address.landmark ? `${address.landmark}, ` : ''}<br/>
                  {address.city}, {address.state} {address.postal_code}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-auto">
                  {!address.is_default && (
                    <form action={async () => {
                      "use server";
                      await setDefaultAddressAction(address.id);
                      revalidatePath('/addresses');
                    }}>
                      <button type="submit" className="text-sm font-medium text-green-600 hover:text-green-700">
                        Set as default
                      </button>
                    </form>
                  )}
                  
                  <form action={async () => {
                    "use server";
                    await deleteAddressAction(address.id);
                    revalidatePath('/addresses');
                  }} className="ml-auto">
                    <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete address">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
