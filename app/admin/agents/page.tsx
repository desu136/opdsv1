'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, adminSidebarItems } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Truck, 
  MoreVertical,
  XCircle,
  Loader2
} from 'lucide-react';

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const statusQuery = activeTab === 'all' ? '' : activeTab === 'pending' ? 'PENDING_REVIEW' : 'ACTIVE';
      const res = await fetch(`/api/users?role=DELIVERY_AGENT&status=${statusQuery}`);
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
  }, [activeTab]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAgents();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to approve: ${errData.error || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Network error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={adminSidebarItems} userRole="Admin" userName="Super Admin" />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
            <div>
               <h1 className="text-2xl font-bold">Delivery Agents</h1>
               <p className="text-slate-500">Manage delivery partners and approve new registrations.</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button onClick={() => setActiveTab('all')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>All</button>
            <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Pending Review</button>
            <button onClick={() => setActiveTab('active')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-green-500 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Active</button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                     <th className="p-4 pl-6 whitespace-nowrap">Agent Name</th>
                     <th className="p-4 whitespace-nowrap">Contact</th>
                     <th className="p-4 whitespace-nowrap">Joined Date</th>
                     <th className="p-4 whitespace-nowrap">Status</th>
                     <th className="p-4 pr-6 text-right whitespace-nowrap">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {isLoading ? (
                     <tr><td colSpan={5} className="p-8 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                   ) : agents.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-slate-500">No delivery agents found.</td></tr>
                   ) : agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0"><Truck className="h-5 w-5" /></div>
                              <div>
                                <p className="font-bold text-slate-900">{agent.name}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4 text-sm">
                           <p className="text-slate-700">{agent.email}</p>
                           <p className="text-slate-500">{agent.phone || 'No phone provided'}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                           {new Date(agent.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {agent.status}
                           </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <div className="flex justify-end gap-2 text-slate-900">
                             {agent.status === 'PENDING_REVIEW' && (
                               <Button size="sm" className="rounded-lg h-8 px-3" onClick={() => handleStatusUpdate(agent.id, 'ACTIVE')} disabled={updatingId === agent.id}>
                                  Approve
                               </Button>
                             )}
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                           </div>
                        </td>
                      </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
