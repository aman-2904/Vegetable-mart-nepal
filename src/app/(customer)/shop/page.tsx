import { getProducts } from "@/lib/services/product.service";
import { getCategories } from "@/lib/services/category.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function ShopContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const categoryId = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort as 'popular' | 'price_asc' | 'price_desc' | 'newest' : undefined;
  // Handle search query
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  
  const { products } = await getProducts({
    categoryId,
    sortBy,
    limit: 50,
    searchQuery: query
  });

  // Filter client side if search is provided since backend might not support it fully without updating getProducts
  const displayProducts = query 
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  if (displayProducts.length === 0) {
    return <EmptyState description="No products found matching your criteria." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const categories = await getCategories();
  const currentCategory = typeof searchParams.category === 'string' ? searchParams.category : '';
  const currentSort = typeof searchParams.sort === 'string' ? searchParams.sort : '';

  return (
    <div className="bg-[#faf9f8] min-h-screen pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumbs & Header */}
        <div className="py-6 flex items-center text-sm font-medium text-gray-500">
          <Link href="/" className="text-green-700 hover:underline">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-900">Shop All</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Filters</h1>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-sm font-bold text-gray-700">Sort by</span>
            <select 
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-green-500 focus:border-green-500 block px-3 py-1.5 font-medium"
              defaultValue={currentSort || "Relevance"}
            >
              <option value="Relevance">Relevance</option>
              <option value="Price">Price</option>
              <option value="Alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              
              {/* Category Filter */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-gray-900">Category</h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <ul className="space-y-3">
                  <li>
                    <Link href={`/shop${currentSort ? `?sort=${currentSort}` : ''}`} className="flex items-center group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${!currentCategory ? 'bg-green-700 border-green-700' : 'border-gray-300 group-hover:border-green-500'}`}>
                        {!currentCategory && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm ${!currentCategory ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>All Products</span>
                    </Link>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <Link href={`/shop?category=${category.id}${currentSort ? `&sort=${currentSort}` : ''}`} className="flex items-center group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${currentCategory === category.id ? 'bg-green-700 border-green-700' : 'border-gray-300 group-hover:border-green-500'}`}>
                          {currentCategory === category.id && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`text-sm ${currentCategory === category.id ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{category.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <hr className="border-gray-200" />

              {/* Origin Filter (Visual Mock) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-gray-900">Origin</h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <ul className="space-y-3">
                  {['Organic', 'Local', 'Farm-Direct'].map((origin, i) => (
                    <li key={origin} className="flex items-center group cursor-not-allowed opacity-70">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 border-gray-300 bg-white`}>
                      </div>
                      <span className={`text-sm text-gray-600`}>{origin}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-gray-200" />

              {/* Price Range (Visual Mock) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-gray-900">Price Range</h3>
                </div>
                <div className="px-2 py-4">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full relative">
                    <div className="absolute left-0 right-1/4 h-full bg-[#4d7c0f] rounded-full"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#4d7c0f] border-2 border-white shadow"></div>
                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-[#4d7c0f] border-2 border-white shadow"></div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Seasonal Picks (Visual Mock) */}
              <div>
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="font-extrabold text-gray-900">Seasonal Picks</h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/shop" className="block w-full py-2.5 text-center text-sm font-bold text-gray-700 border-2 border-[#4d7c0f] rounded bg-transparent hover:bg-green-50 transition-colors">
                  Reset Filters
                </Link>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <ShopContent searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  );
}
