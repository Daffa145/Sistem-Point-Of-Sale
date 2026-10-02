'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/api';
import { ShoppingBag, Plus, Search, Eye, Trash2, X, CheckCircle2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export interface POItem {
  inventory_id: number;
  item_name: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier: string;
  purchase_date: string;
  total_amount: number;
  status: 'received' | 'ordered' | 'cancelled';
  payment_status: 'paid' | 'unpaid';
  notes?: string;
  items: POItem[];
}

const initialPurchases: PurchaseOrder[] = [
  {
    id: 1,
    po_number: 'PO-20260805-001',
    supplier: 'Gayo Coffee Roasters',
    purchase_date: '2026-08-05',
    total_amount: 3600000,
    status: 'received',
    payment_status: 'paid',
    notes: 'Kopi Arabica Grade 1 dikirim tepat waktu',
    items: [
      { inventory_id: 1, item_name: 'Arabica Gayo Espresso Beans', unit: 'kg', quantity: 20, unit_cost: 180000, subtotal: 3600000 },
    ],
  },
  {
    id: 2,
    po_number: 'PO-20260804-002',
    supplier: 'PT Fresh Dairy Nusantara',
    purchase_date: '2026-08-04',
    total_amount: 950000,
    status: 'received',
    payment_status: 'paid',
    notes: 'Susu cair segar kemasan 1L',
    items: [
      { inventory_id: 2, item_name: 'Fresh Whole Milk 1L', unit: 'liter', quantity: 50, unit_cost: 19000, subtotal: 950000 },
    ],
  },
  {
    id: 3,
    po_number: 'PO-20260802-003',
    supplier: 'Indo Bumbu & Sembako Ltd',
    purchase_date: '2026-08-02',
    total_amount: 1500000,
    status: 'ordered',
    payment_status: 'unpaid',
    notes: 'Menunggu konfirmasi kurir logistik',
    items: [
      { inventory_id: 4, item_name: 'Beras Premium 5kg', unit: 'kg', quantity: 20, unit_cost: 75000, subtotal: 1500000 },
    ],
  },
];

const suppliersList = [
  'Gayo Coffee Roasters',
  'PT Fresh Dairy Nusantara',
  'Indo Bumbu & Sembako Ltd',
  'PT Jaya Kemasan Resto',
  'Supplier Nusantara',
];

export default function PurchaseOrderPage() {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(initialPurchases);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [editingPOStatus, setEditingPOStatus] = useState<PurchaseOrder | null>(null);
  const [deletingPO, setDeletingPO] = useState<PurchaseOrder | null>(null);

  // Form State
  const [poForm, setPoForm] = useState({
    supplier: suppliersList[0],
    purchase_date: new Date().toISOString().split('T')[0],
    status: 'received' as 'received' | 'ordered' | 'cancelled',
    payment_status: 'paid' as 'paid' | 'unpaid',
    notes: '',
  });

  const [poItems, setPoItems] = useState<POItem[]>([
    { inventory_id: 1, item_name: 'Arabica Gayo Espresso Beans', unit: 'kg', quantity: 10, unit_cost: 180000, subtotal: 1800000 },
  ]);

  const loadPurchases = () => {
    try {
      const saved = localStorage.getItem('simako_purchases');
      if (saved) {
        setPurchases(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_purchases', JSON.stringify(initialPurchases));
        setPurchases(initialPurchases);
      }
    } catch (e) {
      console.error(e);
      setPurchases(initialPurchases);
    }
  };

  useEffect(() => {
    loadPurchases();
    window.addEventListener('storage', loadPurchases);
    return () => window.removeEventListener('storage', loadPurchases);
  }, []);

  const savePurchases = (updatedList: PurchaseOrder[], message: string) => {
    setPurchases(updatedList);
    localStorage.setItem('simako_purchases', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const autoIncreaseInventory = (items: POItem[]) => {
    try {
      const savedInv = localStorage.getItem('simako_inventories');
      if (!savedInv) return;
      let inventories = JSON.parse(savedInv);

      items.forEach(poIt => {
        const foundIdx = inventories.findIndex((inv: any) =>
          inv.item_name.toLowerCase() === poIt.item_name.toLowerCase() || inv.id === poIt.inventory_id
        );
        if (foundIdx >= 0) {
          inventories[foundIdx].quantity = Math.round((inventories[foundIdx].quantity + poIt.quantity) * 100) / 100;
        }
      });

      localStorage.setItem('simako_inventories', JSON.stringify(inventories));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Auto stock increase error:', e);
    }
  };

  const addPoItemRow = () => {
    setPoItems([
      ...poItems,
      { inventory_id: Date.now(), item_name: 'Fresh Whole Milk 1L', unit: 'liter', quantity: 10, unit_cost: 19000, subtotal: 190000 },
    ]);
  };

  const removePoItemRow = (idx: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const updatePoItemRow = (idx: number, field: keyof POItem, value: any) => {
    const updated = [...poItems];
    (updated[idx] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_cost') {
      updated[idx].subtotal = Number(updated[idx].quantity || 0) * Number(updated[idx].unit_cost || 0);
    }
    setPoItems(updated);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = poItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newPO: PurchaseOrder = {
      id: Date.now(),
      po_number: 'PO-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      supplier: poForm.supplier,
      purchase_date: poForm.purchase_date,
      total_amount: totalAmount,
      status: poForm.status,
      payment_status: poForm.payment_status,
      notes: poForm.notes,
      items: poItems,
    };

    const updated = [newPO, ...purchases];
    savePurchases(updated, `Purchase Order '${newPO.po_number}' berhasil dibuat!`);

    if (poForm.status === 'received') {
      autoIncreaseInventory(poItems);
      addNotification({
        title: 'Barang Received dari Supplier',
        message: `Stok inventaris otomatis bertambah dari PO '${newPO.po_number}' (${poForm.supplier}).`,
        type: 'inventory_deduction',
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleUpdateStatus = (newStatus: 'received' | 'ordered' | 'cancelled', newPayment: 'paid' | 'unpaid') => {
    if (!editingPOStatus) return;

    const previousStatus = editingPOStatus.status;
    const updated = purchases.map(p =>
      p.id === editingPOStatus.id ? { ...p, status: newStatus, payment_status: newPayment } : p
    );

    savePurchases(updated, `Status PO '${editingPOStatus.po_number}' diubah ke ${newStatus.toUpperCase()}.`);

    if (previousStatus !== 'received' && newStatus === 'received') {
      autoIncreaseInventory(editingPOStatus.items);
      addNotification({
        title: 'Status PO Received',
        message: `Barang dari PO '${editingPOStatus.po_number}' diterima. Stok inventaris otomatis ditambahkan.`,
        type: 'inventory_deduction',
      });
    }

    setEditingPOStatus(null);
  };

  const handleDeletePO = () => {
    if (!deletingPO) return;
    const updated = purchases.filter(p => p.id !== deletingPO.id);
    savePurchases(updated, `Purchase Order '${deletingPO.po_number}' telah dihapus.`);
    setDeletingPO(null);
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesStatus = statusFilter === 'Semua' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = p.po_number.toLowerCase().includes(search.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in text-gray-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>Manajemen Purchase Order (PO) Supplier</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Pembelian bahan baku ke supplier & otomatis update stok inventaris</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Purchase Order Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['Semua', 'Received', 'Ordered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64 shrink-0 flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari No. PO / Supplier..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
          />
        </div>
      </div>

      {/* Table PO */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">No. PO</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Tanggal Pembelian</th>
                <th className="p-4">Total Biaya</th>
                <th className="p-4">Status Pengiriman</th>
                <th className="p-4">Status Pembayaran</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Tidak ada data Purchase Order ditemukan
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 font-mono text-xs">{p.po_number}</td>
                    <td className="p-4 font-bold text-gray-800">{p.supplier}</td>
                    <td className="p-4 font-mono text-gray-500">{p.purchase_date}</td>
                    <td className="p-4 font-extrabold text-sm text-blue-600">{formatRupiah(p.total_amount)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                        p.status === 'received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        p.status === 'ordered'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                        p.payment_status === 'paid' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingPO(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Lihat Detail PO"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingPOStatus(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Ubah Status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingPO(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus PO"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PO MODAL (SCROLLBAR FREE) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-3xl w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in max-h-[94vh] flex flex-col text-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-blue-600" /> Buat Purchase Order (PO) Baru
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Nama Supplier</label>
                  <select
                    value={poForm.supplier}
                    onChange={e => setPoForm({ ...poForm, supplier: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold cursor-pointer"
                  >
                    {suppliersList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Tanggal Pembelian</label>
                  <input
                    type="date"
                    required
                    value={poForm.purchase_date}
                    onChange={e => setPoForm({ ...poForm, purchase_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Status Pengiriman Initial</label>
                  <select
                    value={poForm.status}
                    onChange={e => setPoForm({ ...poForm, status: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-bold cursor-pointer"
                  >
                    <option value="received">Received (Diterima & Update Stok)</option>
                    <option value="ordered">Ordered (Menunggu Barang)</option>
                  </select>
                </div>
              </div>

              {/* Items Table Form */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-gray-800 uppercase tracking-wider">Daftar Item Bahan Baku yang Dibeli</p>
                  <button
                    type="button"
                    onClick={addPoItemRow}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah Baris Item
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="col-span-5">
                        <label className="text-xs text-gray-400 font-bold block mb-1">Nama Bahan</label>
                        <input
                          type="text"
                          required
                          value={item.item_name}
                          onChange={e => updatePoItemRow(idx, 'item_name', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-400 font-bold block mb-1">Qty ({item.unit})</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          required
                          value={item.quantity === 0 || (item.quantity as any) === '' ? '' : item.quantity}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                            updatePoItemRow(idx, 'quantity', val === '' ? '' : Number(val));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-extrabold text-gray-900"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-gray-400 font-bold block mb-1">Harga / Unit (Rp)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={item.unit_cost === 0 || (item.unit_cost as any) === '' ? '' : item.unit_cost}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                            updatePoItemRow(idx, 'unit_cost', val === '' ? '' : Number(val));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between pl-1">
                        <span className="font-extrabold text-blue-600 text-sm truncate">{formatRupiah(item.subtotal)}</span>
                        {poItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePoItemRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="font-bold text-gray-800 text-base">Total Biaya Purchase Order:</span>
                <span className="font-extrabold text-2xl text-blue-600">
                  {formatRupiah(poItems.reduce((sum, item) => sum + item.subtotal, 0))}
                </span>
              </div>

              <div>
                <label className="font-bold text-sm text-gray-800 block mb-1.5">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={poForm.notes}
                  onChange={e => setPoForm({ ...poForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none text-gray-900 text-sm"
                  placeholder="Misal: Nomor resi pengiriman / instruksi penyerahan"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  Simpan & Proses PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL PO MODAL (SCROLLBAR FREE) */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl space-y-5 animate-fade-in text-sm max-h-[94vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" /> Detail Purchase Order
              </h3>
              <button onClick={() => setViewingPO(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1.5 text-sm text-gray-600 font-medium">
              <div className="flex justify-between"><span className="text-gray-400">No. PO:</span><span className="font-mono font-bold text-gray-900">{viewingPO.po_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Supplier:</span><span className="font-bold text-gray-900">{viewingPO.supplier}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tanggal:</span><span className="font-mono text-gray-900">{viewingPO.purchase_date}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status:</span><span className="font-extrabold uppercase text-emerald-700">{viewingPO.status}</span></div>
              {viewingPO.notes && <div className="flex justify-between"><span className="text-gray-400">Catatan:</span><span className="italic text-gray-800">{viewingPO.notes}</span></div>}
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs text-gray-700 uppercase tracking-wider">Item Bahan Baku</p>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 text-sm">
                {viewingPO.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{it.item_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{it.quantity} {it.unit} @ {formatRupiah(it.unit_cost)}</p>
                    </div>
                    <span className="font-extrabold text-blue-600 text-base">{formatRupiah(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="font-bold text-gray-800 text-base">TOTAL BIAYA:</span>
              <span className="font-extrabold text-2xl text-blue-600">{formatRupiah(viewingPO.total_amount)}</span>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setViewingPO(null)}
                className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-extrabold text-sm text-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PO STATUS MODAL (SCROLLBAR FREE) */}
      {editingPOStatus && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-2xl space-y-6 animate-fade-in text-sm max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="font-extrabold text-xl text-gray-900">Ubah Status {editingPOStatus.po_number}</h3>

            <div className="space-y-5">
              <div>
                <label className="font-bold text-sm text-gray-800 block mb-2">Status Pengiriman</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['received', 'ordered', 'cancelled'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(st, editingPOStatus.payment_status)}
                      className={`py-3 rounded-2xl font-extrabold text-xs uppercase border transition-all ${
                        editingPOStatus.status === st ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-sm text-gray-800 block mb-2">Status Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['paid', 'unpaid'] as const).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => handleUpdateStatus(editingPOStatus.status, pm)}
                      className={`py-3 rounded-2xl font-extrabold text-xs uppercase border transition-all ${
                        editingPOStatus.payment_status === pm ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPOStatus(null)}
                  className="w-full py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-extrabold text-sm text-gray-700"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PO MODAL (SCROLLBAR FREE) */}
      {deletingPO && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-2xl space-y-6 animate-fade-in text-center text-sm max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900">Konfirmasi Hapus Purchase Order</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus <span className="font-extrabold text-gray-900">"{deletingPO.po_number}"</span>?
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setDeletingPO(null)}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleDeletePO}
                className="px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                Ya, Hapus PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
