import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";

export const revalidate = 3600; // Revalidate every hour

async function FeaturedProducts() {
  const { products } = await getProducts({ limit: 4 });
  
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const categoryLinks = [
    { name: "Leafy Greens", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=200&auto=format&fit=crop" },
    { name: "Root Vegetables", img: "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?q=80&w=200&auto=format&fit=crop" },
    { name: "Seasonal Picks", img: "https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=200&auto=format&fit=crop" },
    { name: "Organic Boxes", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop" },
    { name: "Herbs & Aromatics", img: "https://images.unsplash.com/photo-1508595165502-3e2652e5a405?q=80&w=200&auto=format&fit=crop" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f8]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="bg-white rounded-[32px] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 shadow-sm border border-gray-100">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Fresh from the farm<br/>to your doorstep
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Hand-picked, seasonal organic produce delivered weekly.
            </p>
            <div className="pt-2">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center rounded bg-[#4d7c0f] px-8 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#3f6212] transition-colors"
              >
                Shop New Arrivals
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg border-4 border-white">
              <Image 
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop" 
                alt="Wooden crate of fresh vegetables"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 px-2">Shop by Category</h2>
          
          <div className="flex flex-wrap items-center justify-between gap-6 px-4">
            {categoryLinks.map((cat) => (
              <Link key={cat.name} href={`/shop?q=${cat.name}`} className="flex flex-col items-center gap-3 group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-[#eef1e6] flex items-center justify-center relative p-2 transition-transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-[#eef1e6] rounded-full z-0 opacity-50"></div>
                  <Image src={cat.img} alt={cat.name} fill sizes="112px" className="rounded-full object-cover relative z-10 shadow-inner" />
                </div>
                <span className="text-sm font-bold text-gray-900 group-hover:text-green-700">{cat.name}</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 px-2">
            <Link href="/shop" className="relative h-48 rounded-2xl overflow-hidden group">
              <Image src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Organic" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute bottom-6 left-6 text-white z-20">
                <span className="text-2xl font-bold">Organic Harvest Resources</span>
              </div>
            </Link>
            <Link href="/shop" className="relative h-48 rounded-2xl overflow-hidden group">
              <Image src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Local" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute bottom-6 left-6 text-white z-20">
                <span className="text-2xl font-bold">Local Farm Direct</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-extrabold text-gray-900">Featured Products</h2>
            <Link href="/shop" className="text-sm font-bold text-green-700 hover:underline">
              See all
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* The Green Grocer Promise */}
      <section className="mt-16 bg-[#f0f4ea] py-16 border-y border-[#e2e8da]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">The Green Grocer Promise</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-green-700 text-green-700 flex items-center justify-center p-3">
                {/* SVG Icon for Leaf/Organic */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-14 0V6a7 7 0 0 1 7-7"/></svg>
              </div>
              <span className="font-bold text-gray-900 text-sm max-w-[120px]">100% Organic & Non-GMO</span>
            </div>
            
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-green-700 text-green-700 flex items-center justify-center p-3">
                {/* SVG for Farming */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span className="font-bold text-gray-900 text-sm max-w-[120px]">Sustainably Farmed</span>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-green-700 text-green-700 flex items-center justify-center p-3">
                {/* SVG for Checkmark/Freshness */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span className="font-bold text-gray-900 text-sm max-w-[120px]">Guaranteed Freshness</span>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-green-700 text-green-700 flex items-center justify-center p-3">
                {/* SVG for Map Pin/Local */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="font-bold text-gray-900 text-sm max-w-[120px]">Support Local Growers</span>
            </div>
          </div>
        </div>
      </section>
      


    </div>
  );
}
