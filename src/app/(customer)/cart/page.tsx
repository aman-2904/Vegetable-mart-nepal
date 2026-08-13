"use client";

import Link from "next/link";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/Toaster";
import { useState, useEffect } from "react";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const addToast = useToast(state => state.addToast);
  
  const [mounted, setMounted] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Looks like you haven't added any fresh vegetables to your cart yet.
        </p>
        <Link 
          href="/shop" 
          className="inline-flex h-12 items-center justify-center rounded-full bg-green-600 px-8 text-base font-medium text-white shadow-lg hover:bg-green-700 transition-colors"
        >
          Start Shopping
        </Link>
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
  const deliveryFee = finalSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const finalTotal = finalSubtotal + deliveryFee;

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    setConfirmRemoveId(null);
    addToast(`Removed ${productName} from cart`, "info");
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
      addToast("Cart cleared", "info");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-gray-500 mt-2">{totalItems} items in your cart</p>
          </div>
          <Link href="/shop" className="text-green-700 hover:text-green-800 font-bold flex items-center text-sm bg-green-50 hover:bg-green-100 px-5 py-2.5 rounded-full transition-colors self-start sm:self-auto">
            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const hasDiscount = !!product.discount_price && product.discount_price < product.price;
              const currentPrice = product.discount_price || product.price;
              const itemTotal = currentPrice * item.quantity;
              
              const imageUrl = product.image_url || '/images/placeholder.svg';

              return (
                <div key={product.id} className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative">
                  
                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`} className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  
                  {/* Product Info & Controls */}
                  <div className="flex flex-col flex-1 justify-between py-0.5">
                    <div className="flex justify-between items-start">
                      <div className="pr-8">
                        <Link href={`/products/${product.slug}`} className="font-bold text-gray-900 hover:text-green-600 transition-colors text-base sm:text-lg line-clamp-1">
                          {product.name}
                        </Link>
                        <span className="text-xs sm:text-sm font-medium text-gray-500 block mt-0.5 sm:mt-1">{product.unit}</span>
                      </div>
                      
                      {/* Remove Button */}
                      <div className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0">
                        {confirmRemoveId === product.id ? (
                          <div className="flex flex-col items-end gap-2 bg-white shadow-lg p-3 rounded-lg border border-gray-100 z-20 absolute right-0 top-0">
                            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Remove item?</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleRemove(product.id, product.name)} className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors">Yes</button>
                              <button onClick={() => setConfirmRemoveId(null)} className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">No</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmRemoveId(product.id)}
                            className="p-2 -m-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-3 sm:mt-6 gap-3 sm:gap-4">
                      {/* Price Details */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-start w-full sm:w-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">Price</span>
                          <div className="flex items-baseline gap-1.5 sm:gap-2">
                            <span className="font-extrabold text-gray-900 text-base sm:text-xl">₹{currentPrice}</span>
                            {hasDiscount && (
                              <span className="text-xs sm:text-sm font-medium text-gray-400 line-through">₹{product.price}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile Total Price */}
                        <div className="flex flex-col items-end sm:hidden">
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Total</span>
                          <span className="font-extrabold text-green-700 text-base">₹{itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-start sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto">
                        {/* Quantity */}
                        <div className="flex flex-col items-start sm:items-center">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 hidden sm:block">Qty</span>
                          <div className="flex items-center border border-gray-200 rounded-lg h-8 sm:h-10 w-24 sm:w-28 bg-gray-50">
                            <button 
                              onClick={() => updateQuantity(product.id, item.quantity - 1)}
                              className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-green-700 hover:bg-gray-100 transition-colors rounded-l-lg font-medium"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-bold text-gray-900 text-sm bg-white h-full flex items-center justify-center border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => {
                                if (item.quantity >= product.stock) {
                                  addToast(`Only ${product.stock} available in stock`, "error");
                                } else {
                                  updateQuantity(product.id, item.quantity + 1);
                                }
                              }}
                              className={`w-8 h-full flex items-center justify-center text-gray-600 hover:text-green-700 hover:bg-gray-100 transition-colors rounded-r-lg font-medium ${item.quantity >= product.stock ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
                              disabled={item.quantity >= product.stock}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Desktop Total Price */}
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total</span>
                          <span className="font-extrabold text-green-700 text-xl">₹{itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleClearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
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
                {deliveryFee > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Add ₹{(FREE_DELIVERY_THRESHOLD - finalSubtotal).toFixed(2)} more for free delivery
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-900 font-bold text-lg">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-gray-900">₹{finalTotal.toFixed(2)}</span>
                  <div className="text-xs text-gray-500">Including all taxes</div>
                </div>
              </div>
              
              <Link 
                href="/checkout"
                className="w-full h-14 rounded-full bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
