"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Clock, Truck, Home, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";

interface OrderTrackerProps {
  orderId: string;
  initialStatus: string;
}

const STATUS_STAGES = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'preparing', label: 'Preparing', icon: Loader2 },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTracker({ orderId, initialStatus }: OrderTrackerProps) {
  const [status, setStatus] = useState(initialStatus);
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to realtime changes for this specific order
    const channel = supabase
      .channel(`order-tracker-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const newStatus = payload.new.order_status;
          if (newStatus !== status) {
            setStatus(newStatus);
            addToast(`Order status updated to: ${newStatus.replace(/_/g, ' ')}`, "info");
            router.refresh(); // Refresh page data if necessary
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, status, addToast, router]);

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Order Cancelled</h3>
        <p className="text-red-700">This order has been cancelled and cannot be fulfilled.</p>
      </div>
    );
  }

  // Find current stage index
  const currentIndex = STATUS_STAGES.findIndex(s => s.id === status);
  // If status is somehow not in the array (e.g. legacy status), default to 0
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <h3 className="font-bold text-gray-900 mb-8 text-lg">Live Order Tracking</h3>
      
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full" />
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-6 left-6 h-1 bg-green-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `calc(${activeIndex * (100 / (STATUS_STAGES.length - 1))}% - 1.5rem)` }}
        />

        {/* Stages */}
        <div className="relative flex justify-between">
          {STATUS_STAGES.map((stage, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="flex flex-col items-center relative z-10 w-24">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 delay-100 bg-white
                    ${isCompleted ? 'border-green-500 text-green-500' : 'border-gray-100 text-gray-300'}
                    ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isCurrent && stage.id === 'preparing' ? 'animate-spin' : ''}`} />
                </div>
                <span className={`text-xs font-medium mt-3 text-center transition-colors duration-300 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Realtime Pulse indicator */}
      <div className="absolute top-8 right-8 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Live Updates
      </div>
    </div>
  );
}
