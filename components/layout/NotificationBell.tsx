'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Package, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPusherClient } from '@/lib/pusher';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user) {
      // Pusher setup
      try {
        const pusher = getPusherClient();
        const channel = pusher.subscribe(`user-${user.id}`);
        
        channel.bind('notification-new', (newNotification: any) => {
          setNotifications(prev => [newNotification, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          
          // Show a browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, { body: newNotification.message });
          }
        });

        return () => {
          channel.unbind_all();
          channel.unsubscribe();
        };
      } catch (err) {
        console.warn('Pusher keys missing or invalid:', err);
      }
    }
  }, [user]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <Package className="h-4 w-4 text-primary-600" />;
      case 'APPROVAL': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'ALERT': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative p-2 rounded-full" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-[60] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">We'll notify you about orders and account updates.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3 ${!n.read ? 'bg-primary-50/30' : ''}`}
                    onClick={() => {
                        if (!n.read) markAsRead(n.id);
                    }}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${!n.read ? 'bg-white border-primary-100' : 'bg-slate-50 border-transparent'}`}>
                       {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                         <p className={`text-sm leading-tight truncate ${!n.read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                         <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                           {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                         </span>
                       </div>
                       <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.read && (
                       <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-50 text-center">
            <button className="text-xs font-bold text-primary-600 hover:text-primary-700 p-1">View All Activity</button>
          </div>
        </div>
      )}
    </div>
  );
};
