import { getProducts } from "@/lib/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";
import { Suspense } from "react";



interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function SearchResults({ query }: { query: string }) {
  const { products } = await getProducts({ searchQuery: query, limit: 50 });

  if (products.length === 0) {
    return (
      <EmptyState 
        title="No results found" 
        description={`We couldn't find any products matching "${query}". Try checking your spelling or using different keywords.`}
      />
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">Found <span className="font-bold text-gray-900">{products.length}</span> results for "{query}"</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>
          
          <form action="/search" method="GET" className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for vegetables, fruits..."
              className="block w-full pl-11 pr-32 py-4 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-lg shadow-sm"
            />
            <div className="absolute inset-y-1 right-1">
              <button
                type="submit"
                className="h-full px-6 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 focus:outline-none transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {query ? (
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Enter a search term above to find products.</p>
          </div>
        )}

      </div>
    </div>
  );
}
