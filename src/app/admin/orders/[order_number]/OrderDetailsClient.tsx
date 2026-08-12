"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/lib/actions/admin";
import { ArrowLeft, Package, MapPin, CreditCard, Clock, User, Phone, CheckCircle2, AlertTriangle, Truck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";

export default function OrderDetailsClient({ order }: { order: any }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatusAction(order.id, newStatus);
      if (res.success) {
        addToast(`Order marked as ${newStatus.replace(/_/g, ' ')}`, "success");
        router.refresh();
      } else {
        addToast(res.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

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

  const statusFlow = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.order_status);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Order #{order.order_number}
              <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${getStatusColor(order.order_status)}`}>
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Placed on {new Date(order.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
          <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            {statusFlow.map((status, idx) => {
              if (idx <= currentIndex) return null; // Only show future statuses
              if (idx > currentIndex + 1) return null; // Only show next sequential status
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 transition-colors capitalize flex items-center gap-2"
                >
                  Mark as {status.replace(/_/g, ' ')}
                </button>
              );
            })}
            <button
              onClick={() => {
                if(confirm('Are you sure you want to cancel this order? This cannot be undone.')){
                  handleStatusChange('cancelled')
                }
              }}
              disabled={isUpdating}
              className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Order Items & Customer */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-gray-500">
                  <tr>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium text-right">Quantity</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.order_items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-gray-900">{item.product_name}</td>
                      <td className="py-3 text-right text-gray-500">₹{item.price}</td>
                      <td className="py-3 text-right text-gray-500">{item.quantity} {item.unit}</td>
                      <td className="py-3 text-right font-bold text-gray-900">₹{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 w-full max-w-sm ml-auto">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 text-sm">
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

        {/* Right Col: Details */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Customer Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{order.profile.full_name}</div>
                  <div className="text-xs text-gray-500">{order.profile.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-900">{order.profile.phone}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Delivery Address
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-900 block mb-1">{order.addresses?.full_name}</span>
                {order.addresses?.house}, {order.addresses?.street}, {order.addresses?.area}<br/>
                {order.addresses?.city}, {order.addresses?.state} {order.addresses?.postal_code}
                <span className="block mt-2 font-medium text-gray-900 text-xs">Ph: {order.addresses?.phone}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> {order.payment_method}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm pb-1">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold capitalize ${
                  ['verified', 'collected'].includes(order.payment_status) ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.payment_status}
                </span>
              </div>
              
              {/* If QR and pending, prompt to check payments tab */}
              {order.payment_method === 'qr' && order.payment_status !== 'verified' && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>QR Payment needs verification. Go to the <Link href="/admin/payments" className="font-bold underline">Payments</Link> tab to verify.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
