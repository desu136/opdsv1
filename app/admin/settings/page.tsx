'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, adminSidebarItems } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { 
  Settings, 
  ShieldCheck, 
  Globe, 
  CreditCard,
  Bell,
  Database,
  Link as LinkIcon
} from 'lucide-react';

export default function AdminSettingsPage() {
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
          
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
               <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
               <p className="text-slate-500">Configure global platform rules, integrations, and administration access.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Settings Nav */}
              <div className="col-span-1 space-y-2">
                 <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-primary-700 font-bold rounded-xl shadow-sm border border-slate-200">
                   <Settings className="h-5 w-5" /> General
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <ShieldCheck className="h-5 w-5 text-slate-400" /> Security
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <CreditCard className="h-5 w-5 text-slate-400" /> Payments
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <Bell className="h-5 w-5 text-slate-400" /> Notifications
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <LinkIcon className="h-5 w-5 text-slate-400" /> Integrations
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors border-t border-slate-200 mt-2 pt-4">
                   <Database className="h-5 w-5 text-slate-400" /> Database Backup
                 </button>
              </div>

              {/* Settings Form Area */}
              <div className="col-span-1 md:col-span-3 space-y-6">
                 
                 <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Platform Configuration</h2>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">Platform Name</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input type="text" defaultValue="EthioPharma Delivery Network" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">Base Delivery Fee (ETB)</label>
                          <input type="number" defaultValue="50" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">Platform Commission (%)</label>
                          <input type="number" defaultValue="5" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100">
                         <h3 className="text-sm font-bold text-slate-900 mb-4">Features Toggle</h3>
                         
                         <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-3 cursor-pointer">
                           <div>
                             <p className="font-semibold text-slate-900 text-sm">Allow Automatic Pharmacy Approval</p>
                             <p className="text-xs text-slate-500">New pharmacies will bypass manual Admin review if EFDA ID matches registry.</p>
                           </div>
                           <div className="relative inline-flex items-center">
                             <input type="checkbox" className="sr-only peer" />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                           </div>
                         </label>

                         <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-3 cursor-pointer">
                           <div>
                             <p className="font-semibold text-slate-900 text-sm">Maintenance Mode</p>
                             <p className="text-xs text-slate-500">Temporarily block customer ordering (Pharmacies can still access portals).</p>
                           </div>
                           <div className="relative inline-flex items-center">
                             <input type="checkbox" className="sr-only peer" />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                           </div>
                         </label>
                      </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <Button variant="outline" size="lg" className="rounded-xl px-6 mr-3">
                      Cancel
                    </Button>
                    <Button variant="primary" size="lg" className="rounded-xl px-8 shadow-md">
                      Save Platform Settings
                    </Button>
                 </div>

              </div>
            </div>
            
          </div>

        </main>
      </div>
    </div>
  );
}
