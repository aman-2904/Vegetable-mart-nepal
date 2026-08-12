"use client";

import Link from "next/link";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/Toaster";
import { useState } from "react";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const addToast = useToast(state => state.addToast);
  
  // Local state for tracking which item is being removed for a potential confirmation modal
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

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
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-2">{totalItems} items in your cart</p>
          </div>
          <Link href="/shop" className="text-green-600 hover:text-green-700 font-medium flex items-center text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {/* Header row for desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {items.map((item) => {
              const product = item.product;
              const hasDiscount = !!product.discount_price && product.discount_price < product.price;
              const currentPrice = product.discount_price || product.price;
              const itemTotal = currentPrice * item.quantity;
              
              const imageUrl = product.image_url || `https://source.unsplash.com/400x300/?vegetable,${product.categories?.name || 'fresh'}`;

              return (
                <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative">
                  
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                    <Link href={`/products/${product.slug}`} className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex flex-col">
                      <Link href={`/products/${product.slug}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors text-base md:text-lg">
                        {product.name}
                      </Link>
                      <span className="text-sm text-gray-500 mb-1">{product.unit}</span>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-gray-900">₹{currentPrice}</span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-1 md:col-span-3 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                    <span className="md:hidden text-sm text-gray-500">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-lg h-10 w-28 bg-white">
                      <button 
                        onClick={() => updateQuantity(product.id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-medium text-gray-900 text-sm">
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
                        className={`w-8 h-full flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors ${item.quantity >= product.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={item.quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center mt-2 md:mt-0">
                    <span className="md:hidden text-sm text-gray-500">Total</span>
                    <span className="font-bold text-gray-900">₹{itemTotal.toFixed(2)}</span>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 md:col-span-1 flex justify-end md:justify-end absolute top-4 right-4 md:relative md:top-0 md:right-0">
                    {confirmRemoveId === product.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemove(product.id, product.name)} className="text-xs text-white bg-red-600 px-2 py-1 rounded">Yes</button>
                        <button onClick={() => setConfirmRemoveId(null)} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">No</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmRemoveId(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
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
