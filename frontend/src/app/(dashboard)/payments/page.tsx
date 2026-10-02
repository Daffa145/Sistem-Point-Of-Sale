'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/api';
import { Receipt, Printer } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([
    { id: 1, order_number: 'ORD-20260806-001', table: 'Table 02', cashier: 'Budi Kasir', method: 'qris', amount: 143750, reference: 'QRIS-992817263', status: 'completed', date: '2026-08-06 10:14' },
    { id: 2, order_number: 'ORD-20260806-000', table: 'Table 01', cashier: 'Budi Kasir', method: 'cash', amount: 72450, reference: 'TRX-CASH881', status: 'completed', date: '2026-08-06 09:30' },
  ]);

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-500" />
            <span>Riwayat Transaksi & Pembayaran</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Arsip lengkap transaksi kasir, metode pembayaran & cetak ulang struk</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">No. Order / Ref</th>
                <th className="p-4">Meja</th>
                <th className="p-4">Kasir</th>
                <th className="p-4">Metode Bayar</th>
                <th className="p-4">Total Bayar</th>
                <th className="p-4">Waktu</th>
                <th className="p-4 text-right">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-semibold text-gray-900 font-mono">
                    <p>{p.order_number}</p>
                    <span className="text-[10px] text-gray-400 font-normal">{p.reference}</span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{p.table}</td>
                  <td className="p-4 text-gray-500">{p.cashier}</td>
                  <td className="p-4 uppercase font-semibold text-[11px] text-gray-700">{p.method}</td>
                  <td className="p-4 font-bold text-sm text-blue-600">{formatRupiah(p.amount)}</td>
                  <td className="p-4 text-gray-400 font-mono text-[11px]">{p.date}</td>
                  <td className="p-4 text-right">
                    <button
                      suppressHydrationWarning
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs inline-flex items-center gap-1.5 border border-gray-200 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-500" /> Cetak Struk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
