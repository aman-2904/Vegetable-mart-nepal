import { getCategories } from "@/lib/services/category.service";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Categories | FreshHarvest",
  description: "Browse all our fresh vegetable categories",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">All Categories</h1>
        <p className="text-gray-500 text-center mb-12">Browse our fresh selection of produce</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-50 p-6 flex items-center justify-center flex-1">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-green-50 rounded-xl flex items-center justify-center text-green-200">
                    <span className="text-4xl">🥬</span>
                  </div>
                )}
              </div>
              <div className="p-4 text-center border-t border-gray-50 bg-white">
                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
