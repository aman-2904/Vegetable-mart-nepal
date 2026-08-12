"use client";

import { useState, useEffect } from "react";
import { getAdminProductsAction, updateInventoryAction } from "@/lib/actions/admin";
import { Search, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = async () => {
    const data = await getAdminProductsAction();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', icon: XCircle, color: 'text-red-700 bg-red-50 border-red-200' };
    if (stock <= minStock) return { label: 'Low Stock', icon: AlertTriangle, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    return { label: 'Good', icon: CheckCircle2, color: 'text-green-700 bg-green-50 border-green-200' };
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsSubmitting(true);

    try {
      const res = await updateInventoryAction(editingId, newStock, reason || "Manual adjustment");
      if (res.success) {
        addToast("Inventory updated successfully", "success");
        setEditingId(null);
        setReason("");
        await loadProducts();
      } else {
        addToast(res.error || "Failed to update inventory", "error");
      }
    } catch (error: any) {
      addToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track and adjust product stock levels</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Loading inventory...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Current Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Min Threshold</th>
                  <th className="px-6 py-4 font-medium text-center">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock, product.minimum_stock);
                  const Icon = status.icon;
                  const isEditing = editingId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-gray-400 text-xs font-mono">{product.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-lg text-gray-900">{product.stock}</span>
                        <span className="text-gray-400 text-xs ml-1">{product.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-medium">
                        {product.minimum_stock}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <form onSubmit={handleUpdateStock} className="flex flex-col gap-2 items-end">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="0" 
                                value={newStock} 
                                onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-right border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-green-50 font-bold"
                              />
                              <input 
                                type="text"
                                placeholder="Reason (e.g. Restock)"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-40 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                              <button type="submit" disabled={isSubmitting} className="text-xs bg-green-600 text-white px-3 py-1 rounded font-bold hover:bg-green-700 disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-center">
                            <button 
                              onClick={() => {
                                setEditingId(product.id);
                                setNewStock(product.stock);
                                setReason("");
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors"
                              title="Update Stock"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
