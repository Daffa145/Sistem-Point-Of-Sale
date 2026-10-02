'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/api';
import { FileSpreadsheet, Calendar, Award, Printer, X, Coffee, RefreshCw } from 'lucide-react';

export interface ReportTopItem {
  rank: number;
  name: string;
  qty: number;
  total: number;
}

export interface PaymentBreakdownItem {
  method: string;
  count: number;
  amount: number;
  pct: string;
}

const menuPriceMap: Record<string, number> = {
  'Caffè Latte': 32000,
  'Nasi Goreng Special': 45000,
  'Nasi Goreng Special POS': 45000,
  'Espresso Single': 20000,
  'Caramel Macchiato': 38000,
  'Matcha Latte Ice': 34000,
  'Beef Burger & Fries': 55000,
  'Truffle Fries': 28000,
  'Truffle Parmesan Fries': 28000,
  'Butter Croissant': 24000,
  'Ice Americano': 25000,
  'Spaghetti Carbonara': 48000,
};

const initialSeedOrders = [
  {
    id: 1,
    order_number: 'ORD-20260805-001',
    table: 'Table 02',
    status: 'served',
    order_type: 'dine_in',
    payment_method: 'qris',
    date: '2026-08-05',
    items: [
      { name: 'Nasi Goreng Special', qty: 4, price: 45000 },
      { name: 'Caffè Latte', qty: 6, price: 32000 },
      { name: 'Truffle Fries', qty: 2, price: 28000 },
    ],
  },
  {
    id: 2,
    order_number: 'ORD-20260804-002',
    table: 'Outdoor 01',
    status: 'served',
    order_type: 'dine_in',
    payment_method: 'cash',
    date: '2026-08-04',
    items: [
      { name: 'Beef Burger & Fries', qty: 3, price: 55000 },
      { name: 'Butter Croissant', qty: 4, price: 24000 },
      { name: 'Caffè Latte', qty: 5, price: 32000 },
    ],
  },
  {
    id: 3,
    order_number: 'ORD-20260802-003',
    table: 'Table 01',
    status: 'served',
    order_type: 'dine_in',
    payment_method: 'qris',
    date: '2026-08-02',
    items: [
      { name: 'Spaghetti Carbonara', qty: 2, price: 48000 },
      { name: 'Matcha Latte Ice', qty: 3, price: 34000 },
      { name: 'Ice Americano', qty: 4, price: 25000 },
    ],
  },
  {
    id: 4,
    order_number: 'ORD-20260801-004',
    table: 'Table 03',
    status: 'served',
    order_type: 'takeaway',
    payment_method: 'card',
    date: '2026-08-01',
    items: [
      { name: 'Caffè Latte', qty: 8, price: 32000 },
      { name: 'Caramel Macchiato', qty: 4, price: 38000 },
    ],
  },
];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-11');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Dynamic Data States
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_tax: 0,
    average_order: 0,
    net_sales: 0,
  });

  const [topItems, setTopItems] = useState<ReportTopItem[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdownItem[]>([]);

  const calculateDynamicReports = () => {
    try {
      const savedOrdersRaw = localStorage.getItem('simako_orders');
      let ordersList: any[] = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : initialSeedOrders;
      if (!savedOrdersRaw) {
        localStorage.setItem('simako_orders', JSON.stringify(initialSeedOrders));
      }

      // Filter orders by Date Range
      const startMs = new Date(startDate + 'T00:00:00').getTime();
      const endMs = new Date(endDate + 'T23:59:59').getTime();

      const filteredOrders = ordersList.filter((ord: any) => {
        const orderDateStr = ord.date || (ord.id ? new Date(ord.id).toISOString().split('T')[0] : '2026-08-05');
        const ordMs = new Date(orderDateStr + 'T12:00:00').getTime();
        return ordMs >= startMs && ordMs <= endMs;
      });

      let totalRevenue = 0;
      let totalOrdersCount = filteredOrders.length;
      const productSalesMap: Record<string, { qty: number; total: number }> = {};
      const paymentMap: Record<string, { count: number; amount: number }> = {
        'QRIS Digital Payment': { count: 0, amount: 0 },
        'Cash / Tunai': { count: 0, amount: 0 },
        'Credit / Debit Card': { count: 0, amount: 0 },
      };

      filteredOrders.forEach((ord: any) => {
        let orderSubtotal = 0;
        const items = ord.items || [];

        items.forEach((it: any) => {
          const name = it.name || 'Unknown Item';
          const qty = Number(it.qty || 1);
          const price = Number(it.price || menuPriceMap[name] || 30000);
          const itemSubtotal = qty * price;
          orderSubtotal += itemSubtotal;

          if (!productSalesMap[name]) {
            productSalesMap[name] = { qty: 0, total: 0 };
          }
          productSalesMap[name].qty += qty;
          productSalesMap[name].total += itemSubtotal;
        });

        // Add 10% tax + 5% service charge if dine-in
        const tax = Math.round(orderSubtotal * 0.10);
        const service = ord.order_type === 'dine_in' ? Math.round(orderSubtotal * 0.05) : 0;
        const grandTotal = orderSubtotal + tax + service;
        totalRevenue += grandTotal;

        // Payment Method Categorization
        const pm = (ord.payment_method || 'qris').toLowerCase();
        if (pm.includes('cash') || pm.includes('tunai')) {
          paymentMap['Cash / Tunai'].count += 1;
          paymentMap['Cash / Tunai'].amount += grandTotal;
        } else if (pm.includes('card') || pm.includes('debit') || pm.includes('credit')) {
          paymentMap['Credit / Debit Card'].count += 1;
          paymentMap['Credit / Debit Card'].amount += grandTotal;
        } else {
          paymentMap['QRIS Digital Payment'].count += 1;
          paymentMap['QRIS Digital Payment'].amount += grandTotal;
        }
      });

      // Calculate Summary Numbers
      const totalTax = Math.round(totalRevenue * 0.10);
      const netSales = totalRevenue - totalTax;
      const averageOrder = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

      setSummary({
        total_revenue: totalRevenue,
        total_orders: totalOrdersCount,
        total_tax: totalTax,
        average_order: averageOrder,
        net_sales: netSales,
      });

      // Sort Top Selling Products by Quantity Sold
      const sortedProducts: ReportTopItem[] = Object.entries(productSalesMap)
        .map(([name, data]) => ({
          rank: 0,
          name,
          qty: data.qty,
          total: data.total,
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      setTopItems(sortedProducts);

      // Payment Breakdown Percentages
      const breakdownList: PaymentBreakdownItem[] = Object.entries(paymentMap).map(([method, data]) => {
        const pct = totalRevenue > 0 ? ((data.amount / totalRevenue) * 100).toFixed(1) + '%' : '0%';
        return {
          method,
          count: data.count,
          amount: data.amount,
          pct,
        };
      });

      setPaymentBreakdown(breakdownList);
    } catch (e) {
      console.error('Dynamic reports calculation error:', e);
    }
  };

  useEffect(() => {
    calculateDynamicReports();
    window.addEventListener('storage', calculateDynamicReports);
    return () => window.removeEventListener('storage', calculateDynamicReports);
  }, [startDate, endDate]);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Laporan Penjualan & Omzet Resto (Real-Time)</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Kalkulasi omzet dinamis real-time dari seluruh transaksi POS & cetak PDF</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            suppressHydrationWarning
            onClick={calculateDynamicReports}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
            title="Refresh Kalkulasi"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Filter Periode Tanggal:</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <span className="text-gray-400 font-medium">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Metric Cards - Dynamic Calculated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 font-semibold">Total Omzet Penjualan</span>
          <h3 className="text-xl font-extrabold text-blue-600">{formatRupiah(summary.total_revenue)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 font-semibold">Total Transaksi Order</span>
          <h3 className="text-xl font-extrabold text-gray-900">{summary.total_orders} Transaksi</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 font-semibold">Rata-rata Nilai Order</span>
          <h3 className="text-xl font-extrabold text-emerald-600">{formatRupiah(summary.average_order)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-gray-500 font-semibold">Total Pajak Resto (10%)</span>
          <h3 className="text-xl font-extrabold text-purple-600">{formatRupiah(summary.total_tax)}</h3>
        </div>
      </div>

      {/* Top Menu Sales Table - Dynamic Aggregated */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-5 space-y-4">
        <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-amber-500" />
          <span>Menu Terlaris (Top Selling Products)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">Peringkat</th>
                <th className="p-3">Nama Menu</th>
                <th className="p-3">Total Qty Terjual</th>
                <th className="p-3 text-right">Total Penjualan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Belum ada data penjualan pada periode tanggal ini
                  </td>
                </tr>
              ) : (
                topItems.map((item) => (
                  <tr key={item.rank} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3 font-bold text-blue-600">#{item.rank}</td>
                    <td className="p-3 font-semibold text-gray-900">{item.name}</td>
                    <td className="p-3 font-mono font-semibold text-gray-600">{item.qty} pcs</td>
                    <td className="p-3 text-right font-extrabold text-gray-900">{formatRupiah(item.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRATINJAU DOKUMEN PDF REPORT MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[92vh] flex flex-col">
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900">Pratinjau Dokumen PDF Laporan</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  suppressHydrationWarning
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Cetak / Simpan PDF
                </button>
                <button onClick={() => setShowPdfModal(false)} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable PDF Layout Document */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 rounded-xl border border-gray-200">
              <div
                id="printable-pdf-report"
                className="bg-white text-gray-900 p-8 rounded-xl border border-gray-200 shadow-sm space-y-6 font-sans text-xs max-w-2xl mx-auto"
              >
                {/* Kop Surat Resto */}
                <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight text-gray-900">SIMAKO POS & RESTO</h2>
                      <p className="text-[10px] text-gray-500 font-medium">Jl. Boulevard Raya No. 88, Jakarta Selatan</p>
                      <p className="text-[10px] text-gray-500 font-medium">Telp: (021) 8899-7766 | Email: info@simakopos.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-extrabold text-[10px] uppercase tracking-wider">
                      OFFICIAL REPORT
                    </span>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Dicetak: {new Date().toLocaleString('id-ID')}</p>
                  </div>
                </div>

                {/* Title & Filter Info */}
                <div className="text-center space-y-1">
                  <h1 className="text-base font-extrabold uppercase tracking-wide text-gray-900">
                    LAPORAN RINGKASAN PENJUALAN & OMZET RESTO
                  </h1>
                  <p className="text-xs font-semibold text-gray-600 font-mono">
                    PERIODE LAPORAN: {startDate} s/d {endDate}
                  </p>
                </div>

                {/* Executive Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Omzet</p>
                    <p className="font-extrabold text-sm text-blue-600">{formatRupiah(summary.total_revenue)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Transaksi</p>
                    <p className="font-extrabold text-sm text-gray-900">{summary.total_orders} Transaksi</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Rata-Rata Order</p>
                    <p className="font-extrabold text-sm text-emerald-600">{formatRupiah(summary.average_order)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Pajak Resto (10%)</p>
                    <p className="font-extrabold text-sm text-purple-600">{formatRupiah(summary.total_tax)}</p>
                  </div>
                </div>

                {/* Top Selling Products Table */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                    1. Rincian Produk Terlaris (Top Selling Menu)
                  </h3>
                  <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Nama Produk</th>
                        <th className="p-2.5 text-center">Qty Terjual</th>
                        <th className="p-2.5 text-right">Total Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topItems.map((it) => (
                        <tr key={it.rank}>
                          <td className="p-2.5 font-bold text-center w-8">{it.rank}</td>
                          <td className="p-2.5 font-semibold">{it.name}</td>
                          <td className="p-2.5 text-center font-mono">{it.qty} pcs</td>
                          <td className="p-2.5 text-right font-bold">{formatRupiah(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Method Breakdown */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                    2. Ringkasan Metode Pembayaran
                  </h3>
                  <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="p-2.5">Metode Pembayaran</th>
                        <th className="p-2.5 text-center">Jumlah Transaksi</th>
                        <th className="p-2.5 text-right">Nominal Total</th>
                        <th className="p-2.5 text-right">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentBreakdown.map((pm, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-semibold">{pm.method}</td>
                          <td className="p-2.5 text-center font-mono">{pm.count} tx</td>
                          <td className="p-2.5 text-right font-bold">{formatRupiah(pm.amount)}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-blue-600">{pm.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tanda Tangan Operational */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 text-center text-xs">
                  <div>
                    <p className="text-gray-500 font-semibold mb-12">Dibuat Oleh (Finance Controller)</p>
                    <p className="font-bold text-gray-900 underline">( ............................................ )</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-12">Disetujui Oleh (General Manager)</p>
                    <p className="font-bold text-gray-900 underline">( ............................................ )</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="flex justify-end gap-3 shrink-0 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-xs text-gray-700"
              >
                Batal
              </button>
              <button
                suppressHydrationWarning
                onClick={handlePrintPdf}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> Cetak / Simpan Dokumen PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
