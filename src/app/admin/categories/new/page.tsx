"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCategoryAction } from "@/lib/actions/admin";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";

export default function NewCategoryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    
    let image_url = "";

    try {
      if (imageFile) {
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('categories')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('categories')
          .getPublicUrl(filePath);

        image_url = publicUrlData.publicUrl;
      }

      const res = await createCategoryAction({ name, slug, description, image_url });
      
      if (res.success) {
        addToast("Category created successfully", "success");
        router.push("/admin/categories");
      } else {
        addToast(res.error || "Failed to create category", "error");
      }
    } catch (error: any) {
      addToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new product category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Name <span className="text-red-500">*</span></label>
            <input required name="name" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" placeholder="e.g. Exotic Vegetables" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Slug <span className="text-red-500">*</span></label>
            <input required name="slug" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none font-mono text-sm" placeholder="e.g. exotic-vegetables" />
            <p className="text-xs text-gray-500">Must be unique and URL-friendly (no spaces).</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Description</label>
          <textarea name="description" rows={3} className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none resize-none" placeholder="Brief description of this category..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Category Image</label>
          <div className="flex items-center gap-6 mt-2">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
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
              <p className="text-xs text-gray-500 mt-2">Upload a high-quality image (JPG, PNG). Max 2MB.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
          <Link href="/admin/categories" className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Category"}
          </button>
        </div>

      </form>
    </div>
  );
}
