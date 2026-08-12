"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/services/product.service";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/Toaster";

export default function AddToCartButton({ product, isOutOfStock }: { product: Product, isOutOfStock: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart(state => state.addItem);
  const addToast = useToast(state => state.addToast);

  const handleAdd = () => {
    addItem(product, quantity);
    addToast(`Added ${quantity} ${product.unit} of ${product.name} to cart`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center border border-gray-200 rounded-lg h-12 w-32 bg-white">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
          disabled={isOutOfStock}
        >
          -
        </button>
        <input 
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
          disabled={isOutOfStock}
          className="flex-1 w-full text-center font-medium text-gray-900 border-none focus:ring-0 p-0"
        />
        <button 
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
          disabled={isOutOfStock}
        >
          +
        </button>
      </div>

      <button 
        onClick={handleAdd}
        disabled={isOutOfStock}
        className="flex-1 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  );
}
