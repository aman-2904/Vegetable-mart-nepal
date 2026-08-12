import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <div className="mb-6 px-4 pt-2">
                <h2 className="text-xl font-bold text-gray-900">My Account</h2>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <Link 
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                  <User className="w-5 h-5" /> Profile
                </Link>
                
                <Link 
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" /> Orders
                </Link>

                <Link 
                  href="/addresses"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                  <MapPin className="w-5 h-5" /> Addresses
                </Link>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <form action={async () => {
                  "use server";
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  redirect('/login');
                }}>
                  <button 
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1">
            {children}
          </div>
          
        </div>

      </div>
    </div>
  );
}
