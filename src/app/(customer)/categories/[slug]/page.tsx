import { getCategoryBySlug, getCategories } from "@/lib/services/category.service";
import { getProducts } from "@/lib/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";



interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  return { 
    title: `${category.name} | FreshHarvest`,
    description: category.description || `Browse our fresh selection of ${category.name}. Order online for fast delivery.`,
    openGraph: {
      title: `${category.name} | FreshHarvest`,
      description: category.description || `Browse our fresh selection of ${category.name}. Order online for fast delivery.`,
      images: category.image_url ? [{ url: category.image_url }] : [],
    }
  };
}

async function CategoryProducts({ categoryId, sortBy }: { categoryId: string, sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'newest' }) {
  const { products } = await getProducts({ categoryId, sortBy, limit: 50 });

  if (products.length === 0) {
    return <EmptyState description="We don't have any products in this category right now." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  const currentSort = typeof searchParams.sort === 'string' ? searchParams.sort : '';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Category Header */}
      <div className="bg-green-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center text-green-100 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/shop" className="hover:text-white">Categories</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white font-medium">{category.name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-green-50 max-w-2xl text-lg">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters/Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 gap-4">
          <div className="text-gray-600 font-medium text-sm">
            Browsing <span className="text-gray-900 font-bold">{category.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort by:</span>
            <div className="flex gap-2">
              <Link 
                href={`/categories/${category.slug}`}
                className={`px-3 py-1.5 rounded-md transition-colors ${!currentSort ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Default
              </Link>
              <Link 
                href={`/categories/${category.slug}?sort=price_asc`}
                className={`px-3 py-1.5 rounded-md transition-colors ${currentSort === 'price_asc' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Price: Low to High
              </Link>
              <Link 
                href={`/categories/${category.slug}?sort=price_desc`}
                className={`px-3 py-1.5 rounded-md transition-colors ${currentSort === 'price_desc' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <CategoryProducts 
            categoryId={category.id} 
            sortBy={currentSort as any} 
          />
        </Suspense>
      </div>
    </div>
  );
}
