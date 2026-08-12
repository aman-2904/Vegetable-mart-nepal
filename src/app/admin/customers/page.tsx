import { getAdminCustomersAction } from "@/lib/actions/admin";
import Link from "next/link";
import { Search, ChevronRight, User, ShoppingBag } from "lucide-react";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomersAction();

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and view customer profiles and lifetime value</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-center">Orders</th>
                <th className="px-6 py-4 font-medium text-right">Lifetime Value</th>
                <th className="px-6 py-4 font-medium text-right">Last Order</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer: any) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{customer.full_name || 'No Name'}</div>
                        <div className="text-gray-400 text-xs mt-0.5">Joined {new Date(customer.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{customer.email}</div>
                    <div className="text-gray-500 text-xs">{customer.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full font-bold text-gray-700">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {customer.orders_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-gray-900 text-lg">₹{customer.total_spent.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {customer.last_order_date 
                      ? new Date(customer.last_order_date).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/customers/${customer.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-green-100 text-gray-500 group-hover:text-green-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No customers found.
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
