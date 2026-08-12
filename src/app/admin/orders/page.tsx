import { getAdminOrdersAction } from "@/lib/actions/admin";
import Link from "next/link";
import { Package, Search, ChevronRight, CheckCircle2, Clock, XCircle, Truck, Filter } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string, payment?: string }
}) {
  const orders = await getAdminOrdersAction(searchParams);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'out_for_delivery': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'preparing': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track customer orders</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by order number or customer..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Link href="/admin/orders" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Clear Filters
            </Link>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
              <Link href="/admin/orders?status=pending" className={`px-3 py-2 text-sm font-medium border-r border-gray-200 hover:bg-gray-50 ${searchParams.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600'}`}>Pending</Link>
              <Link href="/admin/orders?status=preparing" className={`px-3 py-2 text-sm font-medium border-r border-gray-200 hover:bg-gray-50 ${searchParams.status === 'preparing' ? 'bg-orange-50 text-orange-700' : 'text-gray-600'}`}>Preparing</Link>
              <Link href="/admin/orders?status=delivered" className={`px-3 py-2 text-sm font-medium hover:bg-gray-50 ${searchParams.status === 'delivered' ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>Delivered</Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.order_number}`} className="font-bold text-gray-900 hover:text-green-600 hover:underline">
                      #{order.order_number}
                    </Link>
                    <div className="text-gray-400 text-xs mt-1">{order.order_items[0].count} items</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.profile.full_name}</div>
                    <div className="text-gray-500 text-xs">{order.profile.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.order_status)}`}>
                      {order.order_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="uppercase text-xs font-bold text-gray-900">{order.payment_method}</span>
                      <span className={`capitalize text-xs font-medium ${['verified', 'collected'].includes(order.payment_status) ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">
                    ₹{order.total}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/orders/${order.order_number}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 text-gray-500 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
