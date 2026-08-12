import { getOrderDetailsAction } from "@/lib/actions/checkout";
import { CheckCircle2, Package, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderSuccessPage({ params }: { params: { order_number: string } }) {
  const order = await getOrderDetailsAction(params.order_number);
  
  if (!order) {
    notFound();
  }

  const isCOD = order.payment_method === 'cod';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center mb-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Thank you for shopping with FreshHarvest. Your order <span className="font-bold text-gray-900">#{order.order_number}</span> has been confirmed.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/shop" 
              className="w-full sm:w-auto px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-full transition-colors"
            >
              Continue Shopping
            </Link>
            <Link 
              href={`/orders/${order.order_number}`} 
              className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors"
            >
              View Order Details
            </Link>
          </div>
        </div>

        {/* Order Details Snippet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-900">Order Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee}`}</span>
              </div>
              <div className="pt-3 border-t flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 block mb-1">Payment Method</span>
              <span className="font-medium text-gray-900 capitalize">
                {isCOD ? 'Cash on Delivery' : 'UPI / QR Code'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-900">Delivery Address</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              <span className="font-medium text-gray-900 block mb-1">{order.addresses?.full_name}</span>
              {order.addresses?.house}, {order.addresses?.street}, {order.addresses?.area}<br/>
              {order.addresses?.city}, {order.addresses?.state} {order.addresses?.postal_code}
            </p>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <Truck className="w-5 h-5" />
              <span>We'll notify you when your order is out for delivery.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
