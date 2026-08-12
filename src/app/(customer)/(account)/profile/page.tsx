import { getProfileAction, updateProfileAction } from "@/lib/actions/profile";
import { UserCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getProfileAction();
  
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
          <UserCircle className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
          <p className="text-gray-500">Update your account details</p>
        </div>
      </div>

      <form action={updateProfileAction as any} className="max-w-xl space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Email Address</label>
          <input 
            type="email" 
            value={profile.email || ''} 
            disabled
            className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none" 
          />
          <p className="text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Full Name</label>
            <input 
              name="full_name" 
              type="text" 
              defaultValue={profile.full_name || ''}
              className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Phone Number</label>
            <input 
              name="phone" 
              type="tel" 
              defaultValue={profile.phone || ''}
              className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="h-12 px-8 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
