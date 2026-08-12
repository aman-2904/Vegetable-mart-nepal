"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveProductAction, getAdminCategoriesAction } from "@/lib/actions/admin";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadCats() {
      const cats = await getAdminCategoriesAction();
      setCategories(cats);
    }
    loadCats();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      category_id: formData.get("category_id") as string,
      unit: formData.get("unit") as string,
      price: parseFloat(formData.get("price") as string),
      discount_price: formData.get("discount_price") ? parseFloat(formData.get("discount_price") as string) : null,
      stock: parseInt(formData.get("stock") as string, 10),
      minimum_stock: parseInt(formData.get("minimum_stock") as string, 10),
      is_active: formData.get("is_active") === "true",
      is_featured: formData.get("is_featured") === "true",
      image_url: ""
    };

    try {
      // Basic Client Validation
      if (data.price < 0) throw new Error("Price cannot be negative");
      if (data.stock < 0) throw new Error("Stock cannot be negative");
      if (data.discount_price && data.discount_price >= data.price) {
        throw new Error("Discount price must be strictly lower than regular price");
      }

      if (imageFile) {
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        data.image_url = publicUrlData.publicUrl;
      }

      const res = await saveProductAction(data);
      
      if (res.success) {
        addToast("Product created successfully", "success");
        router.push("/admin/products");
      } else {
        addToast(res.error || "Failed to create product", "error");
      }
    } catch (error: any) {
      addToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new item in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Product Name <span className="text-red-500">*</span></label>
              <input required name="name" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Slug <span className="text-red-500">*</span></label>
              <input required name="slug" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none font-mono text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Category <span className="text-red-500">*</span></label>
            <select required name="category_id" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none bg-white">
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Description</label>
            <textarea name="description" rows={4} className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none resize-none" />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Price (₹) <span className="text-red-500">*</span></label>
              <input required name="price" type="number" step="0.01" min="0" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Discount Price (₹)</label>
              <input name="discount_price" type="number" step="0.01" min="0" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Unit (e.g. KG, Bunch) <span className="text-red-500">*</span></label>
              <input required name="unit" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" defaultValue="KG" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Initial Stock <span className="text-red-500">*</span></label>
              <input required name="stock" type="number" min="0" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Minimum Stock Alert <span className="text-red-500">*</span></label>
              <input required name="minimum_stock" type="number" min="0" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" defaultValue="10" />
            </div>
          </div>
        </div>

        {/* Media & Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Media & Visibility</h2>
          
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-900">Product Image</label>
            <div className="flex items-center gap-6 mt-2">
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-2">Upload a high-quality product image (JPG, PNG).</p>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="is_active" type="checkbox" value="true" defaultChecked className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-900">Active (Visible in shop)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="is_featured" type="checkbox" value="true" className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-900">Featured (Show on homepage)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Link href="/admin/products" className="px-8 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Publishing..." : "Publish Product"}
          </button>
        </div>

      </form>
    </div>
  );
}
