"use client";

import { useEffect, useState } from "react";
import { getAdminPaymentsAction, updatePaymentStatusAction } from "@/lib/actions/admin";
import { CreditCard, QrCode, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  const loadPayments = async () => {
    const data = await getAdminPaymentsAction();
    setPayments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleStatusUpdate = async (paymentId: string, newStatus: string, orderId: string) => {
    if(!confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) return;
    
    try {
      const res = await updatePaymentStatusAction(paymentId, newStatus, orderId);
      if (res.success) {
        addToast(`Payment marked as ${newStatus}`, "success");
        await loadPayments();
      } else {
        addToast(res.error || "Failed to update payment", "error");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const filteredPayments = payments.filter(p => 
    p.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.order?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Verify QR transactions and track COD collections</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by order number or customer name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Loading payments...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-center">Method</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${payment.order.order_number}`} className="font-bold text-gray-900 hover:text-green-600 hover:underline">
                        #{payment.order.order_number}
                      </Link>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(payment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {payment.order.profile.full_name}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payment.payment_method === 'qr' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                          <QrCode className="w-3.5 h-3.5" /> QR / UPI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                          <CreditCard className="w-3.5 h-3.5" /> COD
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize font-bold ${
                        ['verified', 'collected'].includes(payment.status) ? 'text-green-600' : 
                        payment.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Actions based on method and status */}
                      
                      {/* QR: submitted -> verify / reject */}
                      {payment.payment_method === 'qr' && ['submitted', 'pending'].includes(payment.status) && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleStatusUpdate(payment.id, 'verified', payment.order_id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold border border-green-200 transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Verify
                          </button>
                          <button onClick={() => handleStatusUpdate(payment.id, 'rejected', payment.order_id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold border border-red-200 transition-colors">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                      
                      {/* COD: pending -> collected */}
                      {payment.payment_method === 'cod' && payment.status === 'pending' && (
                        <div className="flex justify-end">
                          <button onClick={() => handleStatusUpdate(payment.id, 'collected', payment.order_id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold border border-green-200 transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Mark Collected
                          </button>
                        </div>
                      )}

                      {/* Verified states display who verified it */}
                      {['verified', 'collected', 'rejected'].includes(payment.status) && payment.verified_by_profile && (
                        <div className="text-xs text-gray-500">
                          {payment.status === 'rejected' ? 'Rejected' : 'Verified'} by <span className="font-bold">{payment.verified_by_profile.full_name}</span>
                          <div className="text-[10px] mt-0.5">{new Date(payment.verified_at).toLocaleDateString()}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
