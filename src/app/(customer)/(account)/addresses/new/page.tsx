import { createAddressAction } from "@/lib/actions/address";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewAddressPage() {
  const handleSave = async (formData: FormData) => {
    "use server";
    const res = await createAddressAction(formData);
    if (res.success) {
      redirect("/addresses");
    } else {
      // Need a redirect back with error if doing it cleanly without client state
      redirect(`/addresses/new?error=${encodeURIComponent(res.error || '')}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        <div className="mb-8">
          <Link href="/addresses" className="text-green-600 hover:text-green-700 font-medium flex items-center text-sm mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Addresses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Address</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <form action={handleSave as any} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Full Name</label>
                <input required name="full_name" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Phone Number</label>
                <input required name="phone" type="tel" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">House / Flat / Block No.</label>
              <input required name="house" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Street / Society</label>
              <input required name="street" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Area / Locality</label>
                <input required name="area" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Landmark (Optional)</label>
                <input name="landmark" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">City</label>
                <input required name="city" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">State</label>
                <input required name="state" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Postal Code</label>
                <input required name="postal_code" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <button type="submit" className="w-full h-12 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors mt-8">
              Save Address
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
