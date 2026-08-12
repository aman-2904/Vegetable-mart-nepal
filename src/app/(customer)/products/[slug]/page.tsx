import { getProductBySlug, getRelatedProducts } from "@/lib/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return { 
    title: product.name,
    description: product.description || `Buy farm-fresh ${product.name} online at the best prices.`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy farm-fresh ${product.name} online at the best prices.`,
      images: product.image_url ? [{ url: product.image_url }] : [],
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id, 4);
  const imageUrl = product.image_url || `https://source.unsplash.com/800x600/?vegetable,${product.categories?.name || 'fresh'}`;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b py-4">
        <div className="container mx-auto px-4 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/shop" className="hover:text-green-600">Shop</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href={`/categories/${product.categories?.slug}`} className="hover:text-green-600">
            {product.categories?.name}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 mb-20">
          
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 relative">
              {hasDiscount && (
                <div className="absolute top-6 left-6 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  SALE
                </div>
              )}
              <img 
                src={imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <Link href={`/categories/${product.categories?.slug}`} className="text-green-600 font-medium mb-2 hover:underline">
              {product.categories?.name}
            </Link>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-extrabold text-gray-900">₹{product.discount_price}</span>
                    <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-gray-900">₹{product.price}</span>
                )}
              </div>
              <span className="text-gray-500">/ {product.unit}</span>
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description || `Fresh and high-quality ${product.name.toLowerCase()} sourced directly from local organic farms. Perfect for your daily nutritional needs.`}
            </p>

            <div className="flex items-center gap-2 mb-8">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} {product.unit} available)
                </span>
              )}
            </div>

            <AddToCartButton product={product} isOutOfStock={isOutOfStock} />

            <div className="mt-10 grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">100% Quality</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
