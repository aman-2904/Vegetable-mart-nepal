import { getOrdersAction } from "@/lib/actions/order";
import Link from "next/link";
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { filter?: 'active' | 'completed' | 'cancelled' };
}) {
  const filter = searchParams.filter;
  const { success, orders } = await getOrdersAction(filter);

  const tabs = [
    { name: 'All Orders', value: undefined },
    { name: 'Active', value: 'active' },
    { name: 'Completed', value: 'completed' },
    { name: 'Cancelled', value: 'cancelled' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'out_for_delivery': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
      <div className="p-6 md:p-8 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage your recent orders</p>
        
        {/* Tabs */}
        <div className="flex gap-4 mt-6 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = filter === tab.value;
            return (
              <Link 
                key={tab.name}
                href={tab.value ? `/orders?filter=${tab.value}` : `/orders`}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1">
        {!success || !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You don't have any {filter ? filter : ''} orders yet.</p>
            <Link href="/shop" className="text-green-600 font-medium hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link 
                key={order.id} 
                href={`/orders/${order.order_number}`}
                className="block border border-gray-100 rounded-2xl p-5 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">#{order.order_number}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize flex items-center gap-1.5 ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        {order.order_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="font-bold text-lg text-gray-900">₹{order.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500 flex justify-between">
                  <span>{order.order_items[0].count} items</span>
                  <span className="capitalize">Payment: <span className={order.payment_status === 'verified' || order.payment_status === 'submitted' || order.payment_status === 'collected' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>{order.payment_status}</span></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
