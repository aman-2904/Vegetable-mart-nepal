import { getAdminBannersAction, toggleBannerStatusAction, deleteBannerAction } from "@/lib/actions/admin";
import Link from "next/link";
import { Plus, Check, X, Image as ImageIcon, Trash2 } from "lucide-react";

export default async function AdminBannersPage() {
  const banners = await getAdminBannersAction();

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage carousel banners</p>
        </div>
        <Link 
          href="/admin/banners/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Banner</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((banner: any) => (
                <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {banner.image_url ? (
                        <img src={banner.image_url} alt={banner.title} className="w-24 h-12 rounded object-cover bg-gray-100 border border-gray-200" />
                      ) : (
                        <div className="w-24 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{banner.title}</div>
                        <div className="text-gray-500 text-xs truncate max-w-[200px]">{banner.subtitle || 'No subtitle'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-bold">{banner.display_order}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      banner.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {banner.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <form action={async () => {
                        "use server";
                        await toggleBannerStatusAction(banner.id, !banner.is_active);
                      }}>
                        <button type="submit" className="text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                          Toggle Status
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await deleteBannerAction(banner.id);
                      }}>
                        <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No banners found.
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
