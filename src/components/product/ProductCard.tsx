"use client";

import Link from "next/link";
import { Product } from "@/lib/services/product.service";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/Toaster";
import { CheckCircle2, MapPin } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { addToast } = useToast();
  
  const isOutOfStock = product.stock <= 0;
  const priceToDisplay = product.discount_price || product.price;

  // Use a generic placeholder based on the category name if no image URL exists
  const imageUrl = product.image_url || `https://source.unsplash.com/400x300/?vegetable,${product.categories?.name || 'fresh'}`;

  // Fake tags for visual purposes matching the mockup
  const isOrganic = product.name.toLowerCase().includes('organic');
  const isLocal = !isOrganic && product.price < 50;

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-green-300">
      
      {/* Top Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden rounded-lg bg-gray-50 aspect-square mb-3">
        {/* Mockup Tags */}
        <div className="absolute left-2 top-2 z-10 flex gap-1">
          {isOrganic && (
            <span className="flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-green-700 shadow-sm border border-gray-100">
              <CheckCircle2 className="h-3 w-3" /> Organic
            </span>
          )}
          {isLocal && (
            <span className="flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-orange-600 shadow-sm border border-gray-100">
              <MapPin className="h-3 w-3" /> Local
            </span>
          )}
        </div>

        <img 
          src={imageUrl} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-1 px-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
        </Link>
        
        {/* Price Row */}
        <div className="flex items-center justify-between mt-1 mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-gray-900">रु{priceToDisplay.toFixed(2)}</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {product.unit === 'KG' ? '1000 gt' : (product.unit === 'GRAM' ? '100 gt' : '1 pc')}
          </span>
        </div>
      </div>

      {/* Full Width Button */}
      <button
        onClick={() => {
          addItem(product);
          addToast(`Added ${product.name} to cart`, "success");
        }}
        disabled={isOutOfStock}
        className="w-full rounded-md bg-[#4d7c0f] py-2 text-sm font-bold text-white transition-colors hover:bg-[#3f6212] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
