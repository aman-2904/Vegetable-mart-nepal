"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Address } from "@/lib/actions/address";
import { placeOrderAction } from "@/lib/actions/checkout";
import { useRouter } from "next/navigation";
import { MapPin, Truck, QrCode, Banknote, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";

interface CheckoutClientProps {
  initialAddresses: Address[];
  storeSettings: any;
  deliveryAreas: any[];
}

export default function CheckoutClient({ initialAddresses, storeSettings, deliveryAreas }: CheckoutClientProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const addToast = useToast(state => state.addToast);
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialAddresses.find(a => a.is_default)?.id || initialAddresses[0]?.id || ""
  );
  
  // Default to COD if enabled, else QR, else COD fallback
  const defaultPayment = storeSettings.cod_enabled !== false ? 'cod' : (storeSettings.qr_enabled !== false ? 'qr' : 'cod');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cod'>(defaultPayment);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">You need to add some items to checkout.</p>
        <Link href="/shop" className="text-green-600 font-medium hover:underline">Return to Shop</Link>
      </div>
    );
  }

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalDiscount = items.reduce((acc, item) => {
    if (item.product.discount_price) {
      return acc + ((item.product.price - item.product.discount_price) * item.quantity);
    }
    return acc;
  }, 0);
  const finalSubtotal = subtotal - totalDiscount;
  
  const meetsMinimum = finalSubtotal >= storeSettings.minimum_order_amount;
  const deliveryFee = finalSubtotal >= storeSettings.free_delivery_threshold ? 0 : storeSettings.delivery_fee;
  const finalTotal = finalSubtotal + deliveryFee;

  // Validation
  const selectedAddress = initialAddresses.find(a => a.id === selectedAddressId);
  const isDeliveryAreaValid = deliveryAreas.length === 0 || // If no areas defined, assume open delivery
    (selectedAddress && deliveryAreas.some(area => area.postal_code === selectedAddress.postal_code));

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast("Please select a delivery address", "error");
      return;
    }
    if (!isDeliveryAreaValid) {
      addToast("Selected address is outside our delivery area", "error");
      return;
    }
    if (!meetsMinimum) {
      addToast(`Minimum order amount is ₹${storeSettings.minimum_order_amount}`, "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await placeOrderAction(selectedAddressId, paymentMethod);
      
      if (result.success && result.orderNumber) {
        clearCart();
        addToast("Order placed successfully!", "success");
        
        if (paymentMethod === 'qr') {
          router.push(`/checkout/qr/${result.orderNumber}`);
        } else {
          router.push(`/checkout/success/${result.orderNumber}`);
        }
      } else {
        addToast(result.error || "Failed to place order.", "error");
        setIsSubmitting(false);
      }
    } catch (err) {
      addToast("An unexpected error occurred", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Left Column */}
      <div className="flex-1 space-y-6">
        
        {/* Address Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">1. Delivery Address</h2>
          </div>
          
          {initialAddresses.length === 0 ? (
            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 mb-4">No addresses found.</p>
              <Link href="/addresses/new" className="text-green-600 font-medium hover:underline">Add New Address</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialAddresses.map(addr => {
                const isValidArea = deliveryAreas.length === 0 || deliveryAreas.some(area => area.postal_code === addr.postal_code);
                
                return (
                  <div 
                    key={addr.id} 
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${selectedAddressId === addr.id ? 'border-green-600 bg-green-50/30' : 'border-gray-100 hover:border-gray-300'} ${!isValidArea ? 'opacity-50' : ''}`}
                  >
                    {selectedAddressId === addr.id && (
                      <div className="absolute top-4 right-4 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 mb-1">{addr.full_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-2">
                      {addr.house}, {addr.street}, {addr.area}<br/>
                      {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    {!isValidArea && (
                      <span className="inline-flex text-[10px] uppercase font-bold tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">Not Deliverable</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {initialAddresses.length > 0 && (
             <div className="mt-4 text-right">
               <Link href="/addresses/new" className="text-sm text-green-600 font-medium hover:underline">Add another address</Link>
             </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Banknote className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">2. Payment Method</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {storeSettings.cod_enabled !== false && (
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'cod' ? 'border-green-600 bg-green-50/30' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Cash on Delivery</h3>
                  <p className="text-sm text-gray-500">Pay when you receive</p>
                </div>
              </div>
            )}

            {storeSettings.qr_enabled !== false && (
              <div 
                onClick={() => setPaymentMethod('qr')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-4 ${paymentMethod === 'qr' ? 'border-green-600 bg-green-50/30' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'qr' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">UPI / QR Code</h3>
                    <p className="text-sm text-gray-500">Pay securely via any UPI app</p>
                  </div>
                </div>
                
                {paymentMethod === 'qr' && storeSettings.qr_code_url && (
                  <div className="mt-2 flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <img 
                      src={storeSettings.qr_code_url} 
                      alt="Merchant UPI QR Code" 
                      className="w-48 h-48 object-contain rounded-lg border border-gray-100 p-2"
                    />
                    <p className="text-xs text-center text-gray-500 mt-3 font-medium">Scan with any UPI app to pay<br/>₹{finalTotal.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{item.product.name}</span>
                  <div className="text-gray-500">{item.quantity} x {item.product.unit}</div>
                </div>
                <div className="font-medium text-gray-900">
                  ₹{((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 border-t pt-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                <span>₹{deliveryFee.toFixed(2)}</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-8">
            <span className="text-gray-900 font-bold text-lg">Total</span>
            <span className="text-2xl font-extrabold text-gray-900">₹{finalTotal.toFixed(2)}</span>
          </div>
          
          {!meetsMinimum && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Minimum order is ₹{storeSettings.minimum_order_amount}. Add ₹{(storeSettings.minimum_order_amount - finalSubtotal).toFixed(2)} more.</p>
            </div>
          )}

          {selectedAddress && !isDeliveryAreaValid && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Sorry, we don't deliver to {selectedAddress.postal_code} yet.</p>
            </div>
          )}

          <button 
            onClick={handlePlaceOrder}
            disabled={!meetsMinimum || !selectedAddressId || !isDeliveryAreaValid || isSubmitting}
            className="w-full h-14 rounded-full bg-green-600 text-white font-bold text-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Placing Order...</span>
            ) : (
              <>Place Order <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
      
    </div>
  );
}
