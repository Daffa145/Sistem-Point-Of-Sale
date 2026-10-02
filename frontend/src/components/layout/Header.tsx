'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChefHat, Boxes, AlertTriangle, CheckCircle2, CreditCard, Check, Trash2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, SystemNotification } from '@/context/NotificationContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearNotifications } = useNotifications();
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';
  const roleName = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Staff';

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderNotifIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'kitchen':
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4" />
          </div>
        );
      case 'inventory_deduction':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
        );
      case 'low_stock':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between"
      style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}
    >
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          suppressHydrationWarning
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Right: Clock + Notifications Popover */}
      <div className="flex items-center gap-1.5 relative" ref={popoverRef}>
        {/* Live Clock */}
        {mounted && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft inline-block" />
            <span>{currentTime}</span>
          </div>
        )}

        {/* Notification Bell Button */}
        <button
          suppressHydrationWarning
          onClick={() => setShowPopover(!showPopover)}
          className={`relative p-2 rounded-lg transition-colors ${
            showPopover ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 rounded-full bg-red-500 text-[10px] font-extrabold text-white flex items-center justify-center px-1 shadow-sm border border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Popover Dropdown */}
        {showPopover && (
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-fade-in text-gray-900">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-600" />
                <h3 className="font-bold text-sm text-gray-900">Notifikasi System</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    suppressHydrationWarning
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                    title="Tandai semua dibaca"
                  >
                    <Check size={13} /> Dibaca
                  </button>
                )}
                <button
                  suppressHydrationWarning
                  onClick={clearNotifications}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus semua"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setShowPopover(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-gray-400 space-y-1">
                  <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-500">Belum ada notifikasi</p>
                  <p className="text-[10px] text-gray-400">Notifikasi order dapur dan stok akan muncul di sini</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notif.is_read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {renderNotifIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[9px] text-gray-400 shrink-0 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-snug mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-medium">SIMAKO Real-time Event Monitor</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {initial}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[13px] font-semibold leading-tight text-gray-800">{user?.name ?? 'User'}</p>
            <span className="text-[10px] text-gray-400 capitalize">{roleName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
