import { getDashboardStatsAction } from "@/lib/actions/admin";
import { DollarSign, ShoppingBag, Clock, Users, PackageOpen } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStatsAction();

  if (!stats) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  // Simple CSS Chart logic for Revenue (simulated 7 days)
  const simulatedChartData = Array.from({length: 7}).map((_, i) => Math.floor(Math.random() * 10000) + 2000);
  const maxChartValue = Math.max(...simulatedChartData);

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome to the FreshHarvest admin portal.</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-green-600 font-medium mt-1">+₹{stats.todayRevenue.toLocaleString()} today</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalOrders}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">+{stats.todayOrdersCount} today</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Orders</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.pendingOrders}</h3>
            <Link href="/admin/orders?status=pending" className="text-xs text-orange-600 font-medium mt-1 hover:underline">View pending</Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customers</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalCustomers}</h3>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CSS Chart: Revenue Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview (Last 7 Days)</h3>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pb-2 border-b border-gray-100 relative">
            {/* Y-Axis Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
              {[1, 0.75, 0.5, 0.25, 0].map((step, i) => (
                <div key={i} className="flex-1 border-t border-dashed border-gray-100" />
              ))}
            </div>

            {/* Bars */}
            {simulatedChartData.map((val, i) => {
              const height = (val / maxChartValue) * 100;
              return (
                <div key={i} className="w-full relative group flex flex-col items-center justify-end h-full z-10">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap">
                    ₹{val.toLocaleString()}
                  </div>
                  <div 
                    className="w-full bg-green-500 hover:bg-green-400 transition-all rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-red-500" /> Low Stock
            </h3>
            <Link href="/admin/inventory" className="text-sm font-medium text-green-600 hover:underline">View All</Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              All products are well stocked!
            </div>
          ) : (
            <div className="space-y-4">
              {stats.lowStockProducts.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-red-600 mt-1">Min threshold: {p.minimum_stock}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-red-600">{p.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
