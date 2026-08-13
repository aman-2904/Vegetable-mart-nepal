"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check, Filter } from "lucide-react";
import { Category } from "@/lib/services/category.service";

interface ShopFiltersProps {
  categories: Category[];
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentQuery = searchParams.get("q") || "";
  
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";

  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const createCategoryUrl = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    return `${pathname}?${params.toString()}`;
  };

  const resetFiltersUrl = () => {
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between font-bold text-gray-900 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`sticky top-24 space-y-8 ${isOpen ? 'block' : 'hidden'} lg:block`}>
        
        {/* Category Filter */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-gray-900">Category</h3>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <ul className="space-y-3">
            <li>
              <Link href={createCategoryUrl("")} className="flex items-center group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${!currentCategory ? 'bg-green-700 border-green-700' : 'border-gray-300 group-hover:border-green-500'}`}>
                  {!currentCategory && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm ${!currentCategory ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>All Products</span>
              </Link>
            </li>
            {categories.map(category => (
              <li key={category.id}>
                <Link href={createCategoryUrl(category.id)} className="flex items-center group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${currentCategory === category.id ? 'bg-green-700 border-green-700' : 'border-gray-300 group-hover:border-green-500'}`}>
                    {currentCategory === category.id && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm ${currentCategory === category.id ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <hr className="border-gray-200" />

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-gray-900">Price Range (रु)</h3>
          </div>
          <div className="px-1 py-2">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={handlePriceKeyDown}
                onBlur={applyFilters}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={handlePriceKeyDown}
                onBlur={applyFilters}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            <button 
              onClick={applyFilters}
              className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-md hover:bg-gray-800 transition-colors"
            >
              Apply Price
            </button>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="pt-2">
          <Link href={resetFiltersUrl()} className="block w-full py-2.5 text-center text-sm font-bold text-gray-700 border-2 border-gray-200 rounded bg-transparent hover:bg-gray-50 hover:border-gray-300 transition-colors">
            Reset Filters
          </Link>
        </div>

      </div>
    </aside>
  );
}
