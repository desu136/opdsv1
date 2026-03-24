'use client';

import React, { useState, useEffect } from 'react';
import { adminSidebarItems } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Users,
  UserPlus,
  MoreVertical,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/users?role=DELIVERY_AGENT');
      if (res.ok) {
        setAgents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <DashboardLayout items={adminSidebarItems} title="Delivery Agents">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Logistics Partners</h1>
             <p className="text-slate-500">Manage delivery agents and fleet performance.</p>
          </div>
          <Button className="rounded-xl flex items-center gap-2">
             <UserPlus className="h-4 w-4" /> Add Agent
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   <th className="p-4 pl-6 whitespace-nowrap">Agent Details</th>
                   <th className="p-4 whitespace-nowrap">Contact</th>
                   <th className="p-4 whitespace-nowrap">Stats</th>
                   <th className="p-4 whitespace-nowrap">Status</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isLoading ? (
                   <tr><td colSpan={5} className="p-12 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading agents...</td></tr>
                 ) : agents.length > 0 ? (
                   agents.map((agent: any) => (
                      <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                 <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{agent.name}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> ID: {agent.id.slice(0, 8)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="flex flex-col gap-0.5">
                              <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Phone className="h-3 w-3" /> {agent.phone}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {agent.email || 'No email'}</p>
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-4 text-center">
                              <div>
                                 <p className="text-xs font-bold text-slate-400">Orders</p>
                                 <p className="font-black text-slate-900">0</p>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-400">Rating</p>
                                 <p className="font-black text-slate-900">4.8</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="h-3 w-3" /> Active
                           </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                   ))
                 ) : (
                   <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No delivery agents registered yet.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
    </DashboardLayout>
  );
}
