import { getAdminCustomerDetailsAction } from "@/lib/actions/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, ChevronRight } from "lucide-react";

export default async function AdminCustomerDetailsPage({ params }: { params: { id: string } }) {
  const data = await getAdminCustomerDetailsAction(params.id);

  if (!data || !data.profile) {
    notFound();
  }

  const { profile } = data;
  const addresses = data.addresses || [];
  const orders = data.orders || [];
  
  const totalSpent = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Customer Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Profile & Metrics */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'No Name'}</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 justify-center text-gray-600">
                <Mail className="w-4 h-4" /> <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 justify-center text-gray-600">
                <Phone className="w-4 h-4" /> <span>{profile.phone || 'No phone'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-sm text-gray-500 font-medium">Total Orders</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{totalOrders}</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">₹</span>
              </div>
              <div className="text-sm text-gray-500 font-medium">Lifetime Value</div>
              <div className="text-2xl font-black text-gray-900 mt-1">₹{totalSpent.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Saved Addresses ({addresses.length})
            </h3>
            <div className="space-y-4">
              {addresses.map((addr: any) => (
                <div key={addr.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl relative">
                  {addr.is_default && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Default</span>
                  )}
                  <h4 className="font-bold text-gray-900 text-sm">{addr.full_name}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {addr.house}, {addr.street}, {addr.area}<br/>
                    {addr.city}, {addr.state} {addr.postal_code}
                  </p>
                  <p className="text-xs font-medium text-gray-700 mt-2">{addr.phone}</p>
                </div>
              ))}
              {addresses.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No addresses saved.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Order History */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[600px]">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
              <ShoppingBag className="w-5 h-5 text-gray-400" /> Order History
            </h3>
            
            <div className="space-y-3">
              {orders.map((order: any) => (
                <Link 
                  key={order.id}
                  href={`/admin/orders/${order.order_number}`}
                  className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
                >
                  <div className="mb-3 sm:mb-0">
                    <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      #{order.order_number}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleString()} • {order.order_items[0].count} items
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="flex flex-col gap-1 items-start sm:items-end">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.order_status === 'delivered' ? 'bg-green-50 text-green-700' :
                        order.order_status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.order_status.replace(/_/g, ' ')}
                      </span>
                      <span className="font-black text-gray-900">₹{order.total}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                  </div>
                </Link>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  This customer hasn't placed any orders yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
