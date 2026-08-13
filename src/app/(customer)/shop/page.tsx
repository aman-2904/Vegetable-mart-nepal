import { getProducts } from "@/lib/services/product.service";
import { getCategories } from "@/lib/services/category.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShopFilters } from "@/components/shop/ShopFilters";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";



interface ShopPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function ShopContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const categoryId = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort as 'popular' | 'price_asc' | 'price_desc' | 'newest' : undefined;
  // Handle search query
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  
  const minPriceStr = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : undefined;
  const minPrice = minPriceStr && !isNaN(parseFloat(minPriceStr)) ? parseFloat(minPriceStr) : undefined;

  const maxPriceStr = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : undefined;
  const maxPrice = maxPriceStr && !isNaN(parseFloat(maxPriceStr)) ? parseFloat(maxPriceStr) : undefined;
  
  const { products } = await getProducts({
    categoryId,
    sortBy,
    limit: 50,
    searchQuery: query,
    minPrice,
    maxPrice
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
          <ShopFilters categories={categories} />

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
