import { getOrderDetailsAction } from "@/lib/actions/order";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import OrderTracker from "./OrderTracker";

export default async function OrderDetailsPage({ params }: { params: { order_number: string } }) {
  const order = await getOrderDetailsAction(params.order_number);

  if (!order) {
    notFound();
  }

  const isCOD = order.payment_method === 'cod';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.order_number}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {new Date(order.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
          </p>
        </div>
      </div>

      {/* Realtime Tracker */}
      <OrderTracker orderId={order.id} initialStatus={order.order_status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            
            <div className="space-y-4">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} x {item.unit} at ₹{item.price}</p>
                  </div>
                  <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee}`}</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          
          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold capitalize ${order.payment_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_method === 'qr' && order.payment_status === 'pending' && (
                <div className="pt-4 mt-2">
                  <Link 
                    href={`/checkout/qr/${order.order_number}`}
                    className="block w-full py-2 text-center bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Complete Payment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-900 block mb-1">{order.addresses?.full_name}</span>
              {order.addresses?.house}, {order.addresses?.street}, {order.addresses?.area}<br/>
              {order.addresses?.city}, {order.addresses?.state} {order.addresses?.postal_code}
            </p>
            <p className="text-sm font-medium text-gray-900 mt-3">{order.addresses?.phone}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
