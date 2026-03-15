'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, adminSidebarItems } from '@/components/layout/Sidebar';
import { 
  Users, 
  Store, 
  TrendingUp, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

// Recent activity is now fetched dynamically

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingPharmacies, setPendingPharmacies] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAdminData = async () => {
    try {
      const [statsRes, pharRes, recentRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/pharmacies?status=PENDING_REVIEW'),
        fetch('/api/users') // Reusing this for activity or creating new endpoint
      ]);
      
      if (statsRes.ok && pharRes.ok) {
        setStats(await statsRes.json());
        setPendingPharmacies(await pharRes.json());
      }

      if (recentRes.ok) {
        const users = await recentRes.json();
        const mapped = users.slice(0, 5).map((u: any) => ({
          id: u.id,
          action: 'New User Registered',
          user: u.name,
          role: u.role,
          time: new Date(u.createdAt).toLocaleDateString(),
          icon: UserPlus,
          color: u.role === 'PHARMACIST' ? 'text-amber-500' : 'text-blue-500',
          bg: u.role === 'PHARMACIST' ? 'bg-amber-50' : 'bg-blue-50'
        }));
        setRecentActivity(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.role === 'ADMIN') fetchAdminData();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          items={adminSidebarItems} 
          userRole="Admin" 
          userName="Super Administrator" 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
               <p className="text-slate-500">Monitor system health, users, and financials.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input type="text" placeholder="Search platform..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" />
               </div>
               <Button variant="primary" className="rounded-xl px-4">Generate Report</Button>
            </div>
          </div>

          {/* System KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isLoading ? (
               <div className="col-span-4 p-8 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : [
              { title: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Global Network' },
              { title: 'Active Pharmacies', value: stats?.activePharmacies?.toLocaleString() || '0', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Verified Partners' },
              { title: 'Today\'s Revenue', value: `ETB ${(stats?.todayRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Live Stats' },
              { title: 'Platform Health', value: 'Optimal', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', trend: 'Secure & Stable' },
            ].map((kpi, idx) => (
               <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  {/* ... rest unchanged ... */}                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-2 rounded-lg ${kpi.bg}`}>
                       <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                     </div>
                     <span className={`text-xs font-semibold ${kpi.trend.startsWith('+') ? 'text-green-600' : kpi.trend.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                       {kpi.trend}
                     </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{kpi.title}</p>
                  </div>
               </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Area: Pharmacy Registration Requests */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Pharmacy Approvals</h2>
                        <p className="text-sm text-slate-500">Review new vendor registrations</p>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                 </div>

                  <div className="divide-y divide-slate-100">
                    {pendingPharmacies.length > 0 ? pendingPharmacies.map(pharmacy => (
                      <div key={pharmacy.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                               <Store className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-900">{pharmacy.name}</h3>
                               <p className="text-sm text-slate-500">{pharmacy.id.slice(0, 8)} • Applied on {new Date(pharmacy.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                           <Link href="/admin/pharmacies?status=pending">
                             <Button variant="primary" className="px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700">
                               Review Docs
                             </Button>
                           </Link>
                         </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-slate-400">No pending approvals.</div>
                    )}
                  </div>
              </div>
              
              {/* Simple Chart Placeholder */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                 <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h2>
                 <div className="h-64 flex items-end justify-between gap-2 md:gap-4 relative">
                    {/* Y-axis labels abstract */}
                     <div className="absolute left-0 top-0 bottom-0 hidden md:flex flex-col justify-between text-xs text-slate-400 pb-6">
                        <span>ETB 5M</span>
                        <span>ETB 2.5M</span>
                        <span>0</span>
                     </div>
                     <div className="w-full flex items-end justify-around pl-0 md:pl-12 h-56 border-b border-slate-100 pb-2">
                       {[30, 45, 25, 60, 50, 80, 70].map((height, i) => (
                         <div key={i} className="w-1/12 bg-primary-100 hover:bg-primary-200 rounded-t-lg transition-colors relative group" style={{ height: `${height}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              Value
                            </div>
                         </div>
                       ))}
                     </div>
                 </div>
                 <div className="flex justify-around pl-0 md:pl-12 mt-2 text-xs font-medium text-slate-500">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                 </div>
              </div>

            </div>

            {/* Sidebar Data Area */}
            <div className="space-y-6">
               
               {/* Activity Feed */}
               <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-slate-900">System Activity</h3>
                   <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
                 </div>
                 
                 <div className="relative">
                   <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-100"></div>
                   <ul className="space-y-6 relative">
                     {recentActivity.map((activity, idx) => (
                       <li key={idx} className="flex gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white z-10 ${activity.bg} ${activity.color}`}>
                            <activity.icon className="h-4 w-4" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{activity.action}</p>
                             <p className="text-xs text-slate-500 mt-0.5">By {activity.user} ({activity.role}) • {activity.time}</p>
                          </div>
                       </li>
                     ))}
                   </ul>
                 </div>
                 
                 <Button variant="outline" className="w-full mt-6 text-sm">View Full Logs</Button>
               </div>
               
               {/* Quick Info */}
               <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 <h3 className="font-bold text-lg mb-2 relative z-10">System Status: Optimal</h3>
                 <p className="text-sm text-slate-300 mb-6 relative z-10">All services (Database, Auth, Payment Gateways) are running normally.</p>
                 <div className="flex justify-between items-center relative z-10">
                   <span className="text-xs text-slate-400">Last checked: Just now</span>
                   <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                     <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> App Active
                   </span>
                 </div>
               </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
