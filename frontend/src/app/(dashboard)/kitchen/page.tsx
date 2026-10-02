'use client';

import React, { useState, useRef } from 'react';
import { ChefHat, Clock, Utensils, CheckCircle2, Wifi, LogOut, Bell, Volume2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const initialOrders = [
  {
    id: 1, order_number: 'ORD-001', table: 'Table 02 — Indoor', time_elapsed: '6 min', status: 'cooking',
    notes: 'Less spicy on Nasi Goreng',
    items: [
      { name: 'Nasi Goreng Special', qty: 1, notes: 'Extra spicy' },
      { name: 'Truffle Fries',       qty: 1, notes: null },
    ],
  },
  {
    id: 2, order_number: 'ORD-002', table: 'Outdoor 01', time_elapsed: '2 min', status: 'queued',
    notes: 'Birthday table',
    items: [
      { name: 'Beef Burger & Fries', qty: 2, notes: 'Medium rare' },
      { name: 'Butter Croissant',   qty: 1, notes: 'Warmed up' },
    ],
  },
  {
    id: 3, order_number: 'ORD-003', table: 'Table 01', time_elapsed: '14 min', status: 'ready',
    notes: null,
    items: [
      { name: 'Spaghetti Carbonara', qty: 1, notes: 'Extra parmesan' },
    ],
  },
];

const columns = [
  {
    id: 'queued',
    label: 'Queued',
    desc: 'Incoming orders',
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-200',
    headerText: 'text-amber-700',
    dotCls: 'bg-amber-500',
    actionLabel: 'Start Cooking',
    actionCls: 'bg-blue-600 hover:bg-blue-700 text-white',
    nextStatus: 'cooking',
  },
  {
    id: 'cooking',
    label: 'Cooking',
    desc: 'In preparation',
    headerBg: 'bg-blue-50',
    headerBorder: 'border-blue-200',
    headerText: 'text-blue-700',
    dotCls: 'bg-blue-500 animate-pulse',
    actionLabel: 'Mark as Ready',
    actionCls: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    nextStatus: 'ready',
  },
  {
    id: 'ready',
    label: 'Ready to Serve',
    desc: 'Awaiting pickup',
    headerBg: 'bg-emerald-50',
    headerBorder: 'border-emerald-200',
    headerText: 'text-emerald-700',
    dotCls: 'bg-emerald-500',
    actionLabel: 'Mark as Served',
    actionCls: 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700',
    nextStatus: 'served',
  },
];

export default function KitchenDisplayPage() {
  const { user, logout } = useAuth();
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const previousOrdersCountRef = useRef<number | null>(null);

  // Web Audio API Pleasant Kitchen Chime Generator
  const playKitchenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // High note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Higher chime note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15); // A5
      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn('Audio context blocked or unsupported:', e);
    }
  };

  const loadOrders = () => {
    try {
      const saved = localStorage.getItem('simako_orders');
      let orders = [];
      if (saved) {
        orders = JSON.parse(saved);
      } else {
        orders = initialOrders;
        localStorage.setItem('simako_orders', JSON.stringify(initialOrders));
      }

      if (previousOrdersCountRef.current !== null && orders.length > previousOrdersCountRef.current) {
        const latestOrder = orders[0];
        playKitchenChime();
        setToastNotification(`🔔 PESANAN DABUR BARU: #${latestOrder.order_number} (${latestOrder.table})`);
        setTimeout(() => setToastNotification(null), 5000);
      }
      previousOrdersCountRef.current = orders.length;
      setKitchenOrders(orders);
    } catch (e) {
      console.error(e);
      setKitchenOrders(initialOrders);
    }
  };

  React.useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => {
      window.removeEventListener('storage', loadOrders);
    };
  }, []);

  const updateStatus = (id: number, nextStatus: string) => {
    let updated;
    if (nextStatus === 'served') {
      updated = kitchenOrders.filter(o => o.id !== id);
    } else {
      updated = kitchenOrders.map(o => o.id === id ? { ...o, status: nextStatus } : o);
    }
    setKitchenOrders(updated);
    localStorage.setItem('simako_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'K';

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden animate-fade-in text-gray-900 relative">
      {/* Toast Notification Alert for New Kitchen Order */}
      {toastNotification && (
        <div className="shrink-0 flex items-center justify-between p-3.5 rounded-2xl bg-orange-600 text-white text-sm font-extrabold shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 animate-spin" />
            <span>{toastNotification}</span>
          </div>
          <button suppressHydrationWarning onClick={() => setToastNotification(null)} className="p-1 hover:bg-orange-700 rounded-lg">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
      {/* Top Bar - Tablet Touch Optimized */}
      <div className="shrink-0 bg-white rounded-2xl border border-gray-200 px-5 py-3 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-600 text-white shadow-md flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 leading-tight">SIMAKO KITCHEN</h1>
            <p className="text-xs text-gray-400 font-medium">Kitchen Monitor Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Orders Info */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>{kitchenOrders.length} Active Orders</span>
          </div>

          {/* User Profile & Logout (Only for non-admin staff, as Admin has top Navbar & Sidebar) */}
          {!['admin', 'manager'].includes(user?.role || '') && (
            <>
              <div className="h-7 w-px bg-gray-200 hidden sm:block mx-1" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-extrabold flex items-center justify-center text-sm">
                  {initial}
                </div>
                <span className="text-sm font-bold text-gray-800 hidden md:inline">{user?.name ?? 'Chef'}</span>
                <button
                  suppressHydrationWarning
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout Kitchen"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
        {columns.map(col => {
          const colOrders = kitchenOrders.filter(o => o.status === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3 h-full min-h-0 bg-gray-50/50 p-3 rounded-2xl border border-gray-200/60">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${col.headerBg} ${col.headerBorder} shrink-0`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotCls}`} />
                  <div>
                    <p className={`text-xs font-bold ${col.headerText}`}>{col.label}</p>
                    <p className="text-[10px] text-gray-400">{col.desc}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${col.headerBg} ${col.headerText}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[60px] pr-1">
                {colOrders.length === 0 ? (
                  <p className="text-center text-xs text-gray-300 py-8">No orders here</p>
                ) : colOrders.map(ord => (
                  <div key={ord.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 font-mono">{ord.order_number}</p>
                        <p className="font-semibold text-sm text-gray-900">{ord.table}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {ord.time_elapsed}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-2">
                      {ord.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                            {item.notes && (
                              <p className="text-[10px] text-amber-600 mt-0.5">★ {item.notes}</p>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-500 shrink-0 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                            ×{item.qty}
                          </span>
                        </div>
                      ))}

                      {ord.notes && (
                        <p className="text-[11px] text-gray-400 italic px-2.5 py-1.5 rounded bg-gray-50 border border-gray-100">
                          📋 {ord.notes}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <div className="px-4 pb-4">
                      <button suppressHydrationWarning
                        onClick={() => updateStatus(ord.id, col.nextStatus)}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors ${col.actionCls}`}
                      >
                        {col.id === 'queued'  && <Utensils     className="w-3.5 h-3.5" />}
                        {col.id === 'cooking' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {col.actionLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
