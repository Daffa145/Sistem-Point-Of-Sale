'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/api';
import { Boxes, Plus, AlertTriangle, ArrowDown, ArrowUp, RefreshCw, Search, Edit, Trash2, X, CheckCircle2 } from 'lucide-react';

export interface InventoryItem {
  id: number;
  item_name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  unit_cost: number;
  supplier: string;
}

const initialInventories: InventoryItem[] = [
  { id: 1, item_name: 'Arabica Gayo Espresso Beans', sku: 'RAW-001', category: 'Raw Material', quantity: 25.5, unit: 'kg', min_stock: 5.0, unit_cost: 180000, supplier: 'Gayo Coffee Roasters' },
  { id: 2, item_name: 'Fresh Whole Milk 1L', sku: 'RAW-002', category: 'Beverage Base', quantity: 8, unit: 'liter', min_stock: 15, unit_cost: 19000, supplier: 'PT Fresh Dairy Nusantara' },
  { id: 3, item_name: 'Vanilla Syrup 750ml', sku: 'RAW-003', category: 'Beverage Base', quantity: 2, unit: 'bottle', min_stock: 3, unit_cost: 140000, supplier: 'Gayo Coffee Roasters' },
  { id: 4, item_name: 'Beras Premium 5kg', sku: 'RAW-004', category: 'Kitchen Supply', quantity: 40, unit: 'kg', min_stock: 10, unit_cost: 75000, supplier: 'Indo Bumbu & Sembako Ltd' },
];

const categoriesList = ['Semua', 'Raw Material', 'Beverage Base', 'Kitchen Supply', 'Packaging'];

export default function InventoryPage() {
  const [inventories, setInventories] = useState<InventoryItem[]>(initialInventories);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [stockAmount, setStockAmount] = useState(0);
  const [stockAction, setStockAction] = useState<'add' | 'subtract'>('add');

  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // Form Input State
  const [formData, setFormData] = useState({
    item_name: '',
    sku: '',
    category: 'Raw Material',
    quantity: 0,
    unit: 'kg',
    min_stock: 5,
    unit_cost: 0,
    supplier: '',
  });

  const loadInventories = () => {
    try {
      const saved = localStorage.getItem('simako_inventories');
      if (saved) {
        setInventories(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_inventories', JSON.stringify(initialInventories));
        setInventories(initialInventories);
      }
    } catch (e) {
      console.error(e);
      setInventories(initialInventories);
    }
  };

  useEffect(() => {
    loadInventories();
    window.addEventListener('storage', loadInventories);
    return () => window.removeEventListener('storage', loadInventories);
  }, []);

  const saveInventories = (updatedList: InventoryItem[], message: string) => {
    setInventories(updatedList);
    localStorage.setItem('simako_inventories', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      item_name: '',
      sku: 'RAW-00' + (inventories.length + 1),
      category: 'Raw Material',
      quantity: 10,
      unit: 'kg',
      min_stock: 5,
      unit_cost: 50000,
      supplier: 'Supplier Nusantara',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.min_stock,
      unit_cost: item.unit_cost,
      supplier: item.supplier,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // UPDATE
      const updated = inventories.map(inv =>
        inv.id === editingItem.id ? { ...inv, ...formData } : inv
      );
      saveInventories(updated, `Bahan '${formData.item_name}' berhasil diperbarui!`);
    } else {
      // CREATE
      const newItem: InventoryItem = {
        id: Date.now(),
        ...formData,
      };
      const updated = [newItem, ...inventories];
      saveInventories(updated, `Bahan baru '${formData.item_name}' berhasil ditambahkan!`);
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (!deletingItem) return;
    const updated = inventories.filter(inv => inv.id !== deletingItem.id);
    saveInventories(updated, `Bahan '${deletingItem.item_name}' telah dihapus.`);
    setDeletingItem(null);
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    const updated = inventories.map(inv => {
      if (inv.id === adjustingItem.id) {
        const newQty = stockAction === 'add'
          ? inv.quantity + stockAmount
          : Math.max(0, inv.quantity - stockAmount);
        return { ...inv, quantity: Math.round(newQty * 100) / 100 };
      }
      return inv;
    });

    saveInventories(updated, `Stok '${adjustingItem.item_name}' berhasil disesuaikan!`);
    setAdjustingItem(null);
    setStockAmount(0);
  };

  const filteredInventories = inventories.filter(inv => {
    const matchesCat = selectedCategory === 'Semua' || inv.category === selectedCategory;
    const matchesSearch = inv.item_name.toLowerCase().includes(search.toLowerCase()) ||
                          inv.sku.toLowerCase().includes(search.toLowerCase()) ||
                          inv.supplier.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in text-gray-900">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button suppressHydrationWarning onClick={() => setToastMessage(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Manajemen Stok Inventaris & Bahan</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Kelola stok bahan baku real-time, adjust & peringatan stok menipis</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bahan Inventaris</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64 shrink-0 flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari bahan / SKU / supplier..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">Bahan Baku / SKU</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Stok Saat Ini</th>
                <th className="p-4">Min. Stok Warning</th>
                <th className="p-4">Harga Beli / Unit</th>
                <th className="p-4">Supplier</th>
                <th className="p-4 text-right">Aksi & Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Tidak ada data bahan inventaris ditemukan
                  </td>
                </tr>
              ) : (
                filteredInventories.map((inv) => {
                  const isLow = inv.quantity <= inv.min_stock;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-sm text-gray-900">{inv.item_name}</p>
                        <span className="font-mono text-[10px] text-gray-400">{inv.sku}</span>
                      </td>
                      <td className="p-4 text-gray-500 font-medium">{inv.category}</td>
                      <td className="p-4">
                        <span className={`font-bold text-sm ${isLow ? 'text-red-600' : 'text-emerald-700'}`}>
                          {inv.quantity} {inv.unit}
                        </span>
                        {isLow && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> LOW
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 font-mono">{inv.min_stock} {inv.unit}</td>
                      <td className="p-4 font-mono text-gray-900">{formatRupiah(inv.unit_cost)}</td>
                      <td className="p-4 text-gray-500 font-medium">{inv.supplier}</td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          suppressHydrationWarning
                          onClick={() => setAdjustingItem(inv)}
                          className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs inline-flex items-center gap-1 border border-gray-200 transition-colors"
                          title="Adjust Stok"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Adjust
                        </button>
                        <button
                          suppressHydrationWarning
                          onClick={() => openEditModal(inv)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Bahan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          suppressHydrationWarning
                          onClick={() => setDeletingItem(inv)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Bahan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT INVENTORY FORM MODAL (SCROLLBAR FREE) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-sm max-h-[94vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-3">
                <Boxes className="w-6 h-6 text-blue-600" />
                {editingItem ? 'Edit Bahan Inventaris' : 'Tambah Bahan Inventaris Baru'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-sm text-gray-800 block mb-1.5">Nama Bahan Baku</label>
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold"
                  placeholder="Contoh: Arabica Gayo Espresso Beans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 font-mono text-sm font-bold"
                    placeholder="RAW-005"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold cursor-pointer"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Beverage Base">Beverage Base</option>
                    <option value="Kitchen Supply">Kitchen Supply</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Jumlah Stok Initial</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={formData.quantity === 0 || (formData.quantity as any) === '' ? '' : formData.quantity}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, quantity: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-extrabold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Satuan Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold"
                    placeholder="kg, liter, bottle, pcs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Batas Min. Warning</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={formData.min_stock === 0 || (formData.min_stock as any) === '' ? '' : formData.min_stock}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, min_stock: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Harga Beli / Unit (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.unit_cost === 0 || (formData.unit_cost as any) === '' ? '' : formData.unit_cost}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setFormData({ ...formData, unit_cost: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-extrabold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-sm text-gray-800 block mb-1.5">Nama Supplier</label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold"
                  placeholder="PT Fresh Dairy Nusantara"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL (SCROLLBAR FREE) */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl space-y-5 animate-fade-in text-sm max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-xl text-gray-900">Adjust Stok: {adjustingItem.item_name}</h3>
              <button onClick={() => setAdjustingItem(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 font-medium">
              Stok saat ini: <span className="font-extrabold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{adjustingItem.quantity} {adjustingItem.unit}</span>
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="font-bold text-sm text-gray-800 block mb-2">Tipe Penyesuaian</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStockAction('add')}
                    className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      stockAction === 'add' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <ArrowUp className="w-5 h-5 text-emerald-600" /> Tambah Stok
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAction('subtract')}
                    className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      stockAction === 'subtract' ? 'bg-red-50 border-red-300 text-red-700 font-extrabold shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <ArrowDown className="w-5 h-5 text-red-600" /> Kurangi Stok
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-sm text-gray-800 block mb-2">Jumlah Kuantitas ({adjustingItem.unit})</label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={stockAmount === 0 || (stockAmount as any) === '' ? '' : stockAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                    setStockAmount(val === '' ? ('' as any) : Number(val));
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-base font-extrabold"
                  placeholder="0.0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setAdjustingItem(null)} className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700">Batal</button>
                <button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95">Simpan Adjust</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (SCROLLBAR FREE) */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-2xl space-y-6 animate-fade-in text-center text-sm max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900">Konfirmasi Hapus Bahan Baku</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus bahan baku <span className="font-extrabold text-gray-900">"{deletingItem.item_name}"</span>?
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                Ya, Hapus Bahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
