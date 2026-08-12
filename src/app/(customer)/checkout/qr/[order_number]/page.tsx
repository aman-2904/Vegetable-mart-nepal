"use client";

import { useEffect, useState } from "react";
import { getOrderDetailsAction, confirmQRPaymentAction } from "@/lib/actions/checkout";
import { QrCode, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import Link from "next/link";

interface QRPaymentPageProps {
  params: { order_number: string };
}

export default function QRPaymentPage({ params }: QRPaymentPageProps) {
  const router = useRouter();
  const addToast = useToast(state => state.addToast);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      const data = await getOrderDetailsAction(params.order_number);
      if (!data) {
        addToast("Order not found", "error");
        router.push("/shop");
      } else {
        setOrder(data);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [params.order_number, router, addToast]);

  const handleConfirmPayment = async () => {
    if (!order) return;
    setSubmitting(true);
    
    // Find the payment ID associated with this order
    const payment = order.payments?.[0];
    if (!payment) {
      addToast("Payment record not found", "error");
      setSubmitting(false);
      return;
    }

    const res = await confirmQRPaymentAction(order.id);
    if (res.success) {
      addToast("Payment confirmation submitted!", "success");
      router.push(`/checkout/success/${order.order_number}`);
    } else {
      addToast(res.error || "Failed to submit payment", "error");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-pulse">Loading order details...</div>;
  if (!order) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-xl text-center">
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan & Pay</h1>
          <p className="text-gray-500 mb-8">
            Please scan the QR code below using any UPI app to complete your payment for order <span className="font-bold text-gray-900">#{order.order_number}</span>.
          </p>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 inline-block mb-8 relative">
            {/* Placeholder QR Code - In a real app this would be a dynamic UPI QR or fetched from store settings */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=store@upi&pn=FreshHarvest&am=${order.total}&cu=INR`} 
              alt="Payment QR Code"
              className="w-48 h-48 md:w-64 md:h-64 rounded-xl object-contain mx-auto"
            />
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
            <p className="text-4xl font-extrabold text-gray-900">₹{order.total}</p>
          </div>

          <button 
            onClick={handleConfirmPayment}
            disabled={submitting}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : (
              <>I Have Paid <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>

          <p className="text-xs text-gray-400">
            Clicking this button will notify the store admin to verify your payment.
          </p>
        </div>

      </div>
    </div>
  );
}
