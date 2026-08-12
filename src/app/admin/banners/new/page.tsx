"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveBannerAction } from "@/lib/actions/admin";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";

export default function NewBannerPage() {
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
    if (!imageFile) {
      addToast("Banner image is required", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      button_text: formData.get("button_text") as string,
      button_url: formData.get("button_url") as string,
      display_order: parseInt(formData.get("display_order") as string, 10),
      is_active: formData.get("is_active") === "true",
      image_url: ""
    };

    try {
      const supabase = createClient();
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      data.image_url = publicUrlData.publicUrl;

      const res = await saveBannerAction(data);
      
      if (res.success) {
        addToast("Banner created successfully", "success");
        router.push("/admin/banners");
      } else {
        addToast(res.error || "Failed to create banner", "error");
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
        <Link href="/admin/banners" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Banner</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new homepage carousel banner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Banner Image (16:9 Recommended) <span className="text-red-500">*</span></label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 gap-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full max-w-md rounded-lg shadow-sm border border-gray-200" />
            ) : (
              <div className="w-full max-w-md h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 border border-gray-300">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              required
              onChange={handleImageChange}
              className="w-full max-w-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Title <span className="text-red-500">*</span></label>
            <input required name="title" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Subtitle</label>
            <input name="subtitle" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Button Text</label>
            <input name="button_text" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" placeholder="e.g. Shop Now" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Button URL</label>
            <input name="button_url" type="text" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" placeholder="e.g. /shop" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Display Order</label>
            <input required name="display_order" type="number" className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" defaultValue="0" />
          </div>
          <div className="space-y-2 flex flex-col justify-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="is_active" type="checkbox" value="true" defaultChecked className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-900">Active (Visible on homepage)</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
          <Link href="/admin/banners" className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Banner"}
          </button>
        </div>

      </form>
    </div>
  );
}
