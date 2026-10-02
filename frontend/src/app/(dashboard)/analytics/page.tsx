'use client';

import React from 'react';
import { formatRupiah } from '@/lib/api';
import { Sparkles, TrendingUp, AlertTriangle, Clock, Zap, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AnalyticsAiPage() {
  const insights = [
    {
      title: 'Prediksi Lonjakan Jam Ramai (Peak Hour)',
      summary: 'Diproyeksikan kenaikan 35% pesanan kopi & pastry antara pukul 14:00 - 17:00 hari ini. Disarankan menyiapkan 2 barista & pre-grind espresso beans.',
      priority: 'high',
      metric: 'Estimasi Rp 4.500.000',
    },
    {
      title: 'Warning Inventaris Milk & Syrup',
      summary: 'Stok Susu Fresh Milk 1L diprediksi habis dalam 1.5 hari berdasarkan kecepatan transaksi Latte. Segera buat PO ke Supplier PT Fresh Dairy.',
      priority: 'critical',
      metric: 'Restock 100 Liter',
    },
    {
      title: 'Rekomendasi Bundling Combo AI',
      summary: 'Kombinasi Caffè Latte + Butter Croissant berpotensi meningkatkan nilai transaksi rata-rata sebesar 22%. Buat promo menu combo jam 08:00 - 11:00.',
      priority: 'medium',
      metric: 'Potensi Omzet +22%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-500/30 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>AI Predictive Analytics Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Analitik AI Resto & Coffee Shop
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Rekomendasi kecerdasan buatan untuk optimasi stok inventaris, prediksi jam ramai, dan pendorong omzet resto.
          </p>
        </div>
      </div>

      {/* AI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border space-y-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Prediksi Omzet Hari Ini
          </span>
          <h3 className="text-2xl font-extrabold text-amber-400">{formatRupiah(4500000)}</h3>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +24% vs kemarin
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border space-y-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Rata-rata Speed Dapur
          </span>
          <h3 className="text-2xl font-extrabold text-blue-400">11.4 Menit</h3>
          <span className="text-[11px] text-muted-foreground">Target &lt; 15 menit</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border space-y-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> Skor Kepuasan Customer
          </span>
          <h3 className="text-2xl font-extrabold text-emerald-400">96.8 %</h3>
          <span className="text-[11px] text-emerald-500 font-semibold">Sangat Tinggi</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border space-y-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Warning Stok AI
          </span>
          <h3 className="text-2xl font-extrabold text-rose-500">2 Bahan</h3>
          <span className="text-[11px] text-rose-400 font-semibold">Segera Restock</span>
        </div>
      </div>

      {/* AI Insight Actionable Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Rekomendasi Tindakan Otomatis AI</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                    ins.priority === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : ins.priority === 'high'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {ins.priority}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">{ins.metric}</span>
                </div>

                <h4 className="font-bold text-sm leading-snug">{ins.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{ins.summary}</p>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all">
                <span>Jalankan Tindakan AI</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
