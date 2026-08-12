import { getAdminProductsAction, toggleProductStatusAction, deleteProductAction } from "@/lib/actions/admin";
import Link from "next/link";
import { Plus, Check, X, Image as ImageIcon, Search, Star, Edit } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await getAdminProductsAction();

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory and catalog</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {product.name} 
                          {product.is_featured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-gray-500 text-xs truncate max-w-[200px] font-mono">/{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">₹{product.price}</div>
                    {product.discount_price && <div className="text-xs text-green-600 line-through">₹{product.discount_price}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <form action={async () => {
                      "use server";
                      await toggleProductStatusAction(product.id, 'is_active', !product.is_active);
                    }}>
                      <button type="submit" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer hover:opacity-80 ${
                        product.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`} title={product.is_active ? "Click to Deactivate" : "Click to Activate"}>
                        {product.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <form action={async () => {
                        "use server";
                        await toggleProductStatusAction(product.id, 'is_featured', !product.is_featured);
                      }}>
                        <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${product.is_featured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-500 hover:bg-gray-100'}`} title="Toggle Featured">
                          <Star className="w-4 h-4" />
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await deleteProductAction(product.id);
                      }}>
                        <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
