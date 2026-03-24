'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, adminSidebarItems } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Users,
  ShieldAlert,
  ShieldCheck,
  UserCircle,
  MoreVertical,
  Loader2,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'PHARMACIST': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'DELIVERY_AGENT': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <DashboardLayout items={adminSidebarItems} title="User Management">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Platform Users</h1>
             <p className="text-slate-500">Manage all registered accounts across the platform.</p>
          </div>
          <div className="relative w-full md:w-80">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
               <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
               />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   <th className="p-4 pl-6 whitespace-nowrap">User Name</th>
                   <th className="p-4 whitespace-nowrap">Role</th>
                   <th className="p-4 whitespace-nowrap">Joined</th>
                   <th className="p-4 whitespace-nowrap">Affiliation</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isLoading ? (
                   <tr><td colSpan={5} className="p-12 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading users...</td></tr>
                 ) : filteredUsers.length > 0 ? (
                   filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 uppercase font-bold">
                                 {user.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getRoleBadge(user.role)}`}>
                             {user.role}
                           </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                           {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-700">
                           {user.pharmacy?.name || (user.role === 'ADMIN' ? 'Platform Admin' : 'Freelance')}
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                   ))
                 ) : (
                   <tr><td colSpan={5} className="p-12 text-center text-slate-400">No users found.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
    </DashboardLayout>
  );
}
