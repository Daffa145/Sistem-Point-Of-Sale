'use client';

import React from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/api';
import {
  Banknote,
  ShoppingBag,
  Grid2X2,
  AlertTriangle,
  ArrowUpRight,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Coffee,
} from 'lucide-react';

const statusMap: Record<string, { label: string; cls: string }> = {
  'Cooking':          { label: 'Cooking',        cls: 'status-cooking' },
  'Sent to Kitchen':  { label: 'In Queue',        cls: 'status-pending' },
  'Ready to Serve':   { label: 'Ready to Serve',  cls: 'status-ready' },
};

export default function DashboardPage() {
  const kpis = [
    {
      title: 'Revenue Today',
      value: formatRupiah(1_437_500),
      change: '+18.4% vs yesterday',
      icon: Banknote,
      positive: true,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: '42 Orders',
      change: '+12 from yesterday',
      icon: ShoppingBag,
      positive: true,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Tables Occupied',
      value: '3 / 7 Tables',
      change: '42% occupancy rate',
      icon: Grid2X2,
      positive: true,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Low Stock Items',
      value: '2 Ingredients',
      change: 'Needs restocking',
      icon: AlertTriangle,
      positive: false,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
  ];

  const quickActions = [
    { label: 'Open POS Cashier',  href: '/pos',       icon: UtensilsCrossed, desc: 'Start new table orders',       primary: true },
    { label: 'Kitchen Display',   href: '/kitchen',   icon: ChefHat,         desc: 'View active cooking queue',    primary: false },
    { label: 'Table Management',  href: '/tables',    icon: Grid2X2,         desc: 'Manage tables & QR codes',     primary: false },
    { label: 'Sales Reports',     href: '/reports',   icon: BarChart3,       desc: 'Revenue & daily summary',      primary: false },
  ];

  const activeOrders = [
    { id: 'ORD-001', table: 'Table 02', items: '2x Caffè Latte, 1x Nasi Goreng',   total: 143_750, status: 'Cooking' },
    { id: 'ORD-002', table: 'Outdoor 01', items: '1x Matcha Ice, 1x Truffle Fries', total: 62_000,  status: 'Sent to Kitchen' },
    { id: 'ORD-003', table: 'Table 01',   items: '1x Ice Americano, 1x Croissant',  total: 49_000,  status: 'Ready to Serve' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/pos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Open POS Cashier
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium truncate">{kpi.title}</p>
                  <p className="text-lg xl:text-xl font-bold text-gray-900 mt-1 truncate">{kpi.value}</p>
                  <p className={`text-[11px] mt-1 flex items-center gap-1 font-medium truncate ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">{kpi.change}</span>
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${kpi.iconColor}`} style={{ width: 18, height: 18 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((qa, idx) => {
          const Icon = qa.icon;
          return (
            <Link
              key={idx}
              href={qa.href}
              className={`p-4 rounded-xl border flex items-center gap-3 group transition-all
                ${qa.primary
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${qa.primary ? 'bg-white/15' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                <Icon className={`w-4 h-4 ${qa.primary ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${qa.primary ? 'text-white' : 'text-gray-800'}`}>{qa.label}</p>
                <p className={`text-[11px] truncate ${qa.primary ? 'text-blue-100' : 'text-gray-400'}`}>{qa.desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ml-auto shrink-0 ${qa.primary ? 'text-white/50' : 'text-gray-300'}`} />
            </Link>
          );
        })}
      </div>

      {/* Active Orders + AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Orders Table */}
        <div className="lg:col-span-2 card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400"/>
              <h2 className="font-semibold text-sm text-gray-800">Active Orders</h2>
              <span className="badge bg-gray-100 text-gray-500 border-0">{activeOrders.length} running</span>
            </div>
            {/* <Link href="/pos" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
              Open POS <ChevronRight className="w-3.5 h-3.5" />
            </Link> */}
          </div>

          <div className="divide-y divide-gray-50">
            {activeOrders.map((ord) => {
              const s = statusMap[ord.status] ?? { label: ord.status, cls: 'bg-gray-100 text-gray-500' };
              return (
                <div key={ord.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-800">{ord.id}</span>
                      <span className="text-[11px] text-gray-400">— {ord.table}</span>
                    </div>
                    <p className="text-[12px] text-gray-500 truncate">{ord.items}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-semibold text-sm text-gray-800">{formatRupiah(ord.total)}</span>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Panel */}
        <div className="card rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h2 className="font-semibold text-sm text-gray-800">AI Insights</h2>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="p-3.5 rounded-lg border border-amber-100 bg-amber-50">
              <p className="text-[11px] font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                Peak Hour Prediction
              </p>
              <p className="text-[12px] text-amber-800 leading-relaxed">
                Order surge expected at <strong>14:00–17:00</strong>. Prepare Fresh Milk stock and barista staff.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-red-100 bg-red-50">
              <p className="text-[11px] font-semibold text-red-600 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                Inventory Alert
              </p>
              <p className="text-[12px] text-red-700 leading-relaxed">
                <strong>Fresh Milk 1L</strong> and <strong>Vanilla Syrup</strong> are below minimum stock.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50">
              <p className="text-[11px] font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                <Coffee className="w-3 h-3" />
                Top Seller Today
              </p>
              <p className="text-[12px] text-emerald-800">
                <strong>Caffè Latte</strong> — 18 cups sold. Consider a weekend bundle promo.
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100">
            <Link href="/analytics" className="block w-full py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-center text-gray-600 hover:bg-gray-50 transition-colors">
              View Full AI Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
