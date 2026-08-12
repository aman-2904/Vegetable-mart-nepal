export function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
      <div className="block overflow-hidden rounded-xl bg-gray-200 aspect-[4/3] mb-4"></div>
      
      <div className="flex flex-col gap-2 mb-4">
        <div className="h-3 w-1/3 rounded-full bg-gray-200"></div>
        <div className="h-5 w-3/4 rounded-full bg-gray-200"></div>
        <div className="h-4 w-full rounded-full bg-gray-100"></div>
        <div className="h-4 w-5/6 rounded-full bg-gray-100"></div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex flex-col gap-1">
          <div className="h-6 w-16 rounded-full bg-gray-200"></div>
          <div className="h-3 w-12 rounded-full bg-gray-100"></div>
        </div>
        
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
