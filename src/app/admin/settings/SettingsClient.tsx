"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminSettingsAction, saveDeliveryAreaAction, deleteDeliveryAreaAction } from "@/lib/actions/admin";
import { Settings, Truck, CreditCard, QrCode, Save, Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient({ initialSettings, initialDeliveryAreas }: { initialSettings: any, initialDeliveryAreas: any[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'delivery' | 'payments'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  
  const [deliveryAreas, setDeliveryAreas] = useState(initialDeliveryAreas);
  const [newArea, setNewArea] = useState({ city: 'Bengaluru', area: '', postal_code: '', is_active: true });
  const [isAddingArea, setIsAddingArea] = useState(false);

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data: any = {
      id: initialSettings.id,
      store_name: formData.get("store_name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      currency: formData.get("currency"),
      minimum_order_amount: parseFloat(formData.get("minimum_order_amount") as string),
      delivery_fee: parseFloat(formData.get("delivery_fee") as string),
      free_delivery_threshold: parseFloat(formData.get("free_delivery_threshold") as string),
      store_status: formData.get("store_status"),
      cod_enabled: formData.get("cod_enabled") === "true",
      qr_enabled: formData.get("qr_enabled") === "true",
    };

    try {
      if (qrFile) {
        const supabase = createClient();
        const fileExt = qrFile.name.split('.').pop();
        const fileName = `qr_${Date.now()}.${fileExt}`;
        
        // Upload to a new 'settings' bucket or 'banners' since it exists. Let's use banners bucket since it's already public
        const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, qrFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
        data.qr_code_url = publicUrlData.publicUrl;
      }

      const res = await updateAdminSettingsAction(data);
      if (res.success) {
        addToast("Settings updated successfully", "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update settings", "error");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDeliveryArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingArea(true);
    try {
      const res = await saveDeliveryAreaAction(newArea);
      if (res.success) {
        addToast("Area added", "success");
        setNewArea({ ...newArea, area: '', postal_code: '' });
        router.refresh();
      } else {
        addToast(res.error || "Failed to add area", "error");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsAddingArea(false);
    }
  };

  const handleDeleteArea = async (id: string) => {
    if(!confirm("Delete this delivery area?")) return;
    try {
      await deleteDeliveryAreaAction(id);
      addToast("Area deleted", "success");
      router.refresh();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your store's behavior, delivery, and payments</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'general' ? 'bg-white shadow-sm text-green-700 border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Settings className="w-4 h-4" /> General Settings
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'payments' ? 'bg-white shadow-sm text-green-700 border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <CreditCard className="w-4 h-4" /> Payment Methods
          </button>
          <button 
            onClick={() => setActiveTab('delivery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'delivery' ? 'bg-white shadow-sm text-green-700 border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Truck className="w-4 h-4" /> Delivery Areas
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          
          <form onSubmit={handleSettingsSubmit} className={activeTab === 'delivery' ? 'hidden' : 'block'}>
            
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Store Name</label>
                    <input name="store_name" defaultValue={initialSettings?.store_name} required className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Store Status</label>
                    <select name="store_status" defaultValue={initialSettings?.store_status} className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none">
                      <option value="open">Open (Accepting Orders)</option>
                      <option value="closed">Closed (Maintenance)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Phone</label>
                    <input name="phone" defaultValue={initialSettings?.phone} className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Email</label>
                    <input name="email" defaultValue={initialSettings?.email} className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-900">Address</label>
                    <textarea name="address" defaultValue={initialSettings?.address} rows={2} className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none resize-none" />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-8">Delivery & Pricing Rules</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Currency</label>
                    <input name="currency" defaultValue={initialSettings?.currency} className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Minimum Order Amount</label>
                    <input name="minimum_order_amount" type="number" step="0.01" defaultValue={initialSettings?.minimum_order_amount} required className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Base Delivery Fee</label>
                    <input name="delivery_fee" type="number" step="0.01" defaultValue={initialSettings?.delivery_fee} required className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-sm font-medium text-gray-900">Free Delivery Threshold (Subtotal)</label>
                    <input name="free_delivery_threshold" type="number" step="0.01" defaultValue={initialSettings?.free_delivery_threshold} required className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Cash on Delivery (COD)</h2>
                  <p className="text-sm text-gray-500 mb-4">Allow customers to pay cash when their order arrives.</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="cod_enabled" type="checkbox" value="true" defaultChecked={initialSettings?.cod_enabled} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-sm font-medium text-gray-900">Enable COD</span>
                  </label>
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">UPI / QR Payment</h2>
                  <p className="text-sm text-gray-500 mb-4">Allow customers to pay by scanning your business QR code.</p>
                  <label className="flex items-center gap-2 cursor-pointer mb-6">
                    <input name="qr_enabled" type="checkbox" value="true" defaultChecked={initialSettings?.qr_enabled} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-sm font-medium text-gray-900">Enable QR Payments</span>
                  </label>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Upload Business QR Code</label>
                    <div className="flex items-start gap-6 mt-2">
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative shrink-0">
                        {qrFile ? (
                          <img src={URL.createObjectURL(qrFile)} alt="Preview" className="w-full h-full object-cover" />
                        ) : initialSettings?.qr_code_url ? (
                          <img src={initialSettings.qr_code_url} alt="Current QR" className="w-full h-full object-cover" />
                        ) : (
                          <QrCode className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => setQrFile(e.target.files?.[0] || null)}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">Upload your Merchant UPI QR code. Customers will scan this during checkout.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>

          {/* Delivery Areas Interface */}
          {activeTab === 'delivery' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Delivery Areas</h2>
                <p className="text-sm text-gray-500">Only customers in these pin codes can checkout.</p>
              </div>

              <form onSubmit={handleAddDeliveryArea} className="flex gap-2 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <input required placeholder="City" value={newArea.city} onChange={e=>setNewArea({...newArea, city: e.target.value})} className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-green-500" />
                <input required placeholder="Area Name" value={newArea.area} onChange={e=>setNewArea({...newArea, area: e.target.value})} className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-green-500" />
                <input required placeholder="Postal Code (PIN)" value={newArea.postal_code} onChange={e=>setNewArea({...newArea, postal_code: e.target.value})} className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-green-500" />
                <button type="submit" disabled={isAddingArea} className="px-4 py-2 bg-gray-900 text-white rounded font-bold text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1">
                  {isAddingArea ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
                </button>
              </form>

              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Area</th>
                    <th className="px-4 py-3 font-medium">PIN Code</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialDeliveryAreas.map(area => (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900">{area.city}</td>
                      <td className="px-4 py-3 text-gray-700">{area.area}</td>
                      <td className="px-4 py-3 font-mono text-gray-500">{area.postal_code}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteArea(area.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {initialDeliveryAreas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No delivery areas configured. Add one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
