import React from 'react';
import Link from 'next/link';
import { Package, Clock, ShieldCheck, MapPin, ChevronRight, Activity, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils'; // Assuming cn is in utils if shared, or update import if it was in button

export interface OrderItemProps {
  name: string;
  quantity: number;
}

export interface OrderProps {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  items: { product: { name: string }, quantity: number }[];
  pharmacy: { name: string };
  prescription?: { status: string } | null;
}

const statusConfig = {
  PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  PREPARING: { label: 'Preparing', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package },
  READY: { label: 'Ready for Pickup', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ShieldCheck },
  IN_TRANSIT: { label: 'On its Way', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity },
  COMPLETED: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: MapPin },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export const OrderCard = ({ order }: { order: OrderProps }) => {
  const StatusIcon = statusConfig[order.status].icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</span>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5",
              statusConfig[order.status]?.color || 'bg-slate-100'
            )}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig[order.status]?.label || order.status}
            </span>
          </div>
          <span className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="text-left sm:text-right">
          <span className="text-sm text-slate-500 block mb-1">Total Amount</span>
          <span className="text-lg font-bold text-slate-900">
            {order.totalAmount.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400" />
              Items from {order.pharmacy.name}
            </h4>
            <ul className="space-y-2">
              {order.items.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-600 flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                  <span className="truncate pr-4">{item.product.name}</span>
                  <span className="font-medium text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">x{item.quantity}</span>
                </li>
              ))}
            </ul>
            
            {order.prescription && (
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                <ShieldCheck className="h-4 w-4" />
                Prescription: {order.prescription.status.replace('_', ' ')}
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-slate-100"></div>

          {/* Action Area */}
          <div className="flex flex-col justify-center gap-3 min-w-[140px]">
            <Link href={`/tracking/${order.id}`} className="w-full">
              <Button variant="primary" className="w-full justify-between group">
                Track
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
