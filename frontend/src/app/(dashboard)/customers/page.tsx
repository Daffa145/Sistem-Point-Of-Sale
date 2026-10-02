'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Award, 
  Phone, 
  Mail, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  PlusCircle, 
  MinusCircle, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  points: number;
}

const initialCustomers: Customer[] = [
  { id: 1, name: 'Dewi Sartika', phone: '081122334455', email: 'dewi@example.com', points: 120, address: 'Jakarta South' },
  { id: 2, name: 'Rizky Ramadhan', phone: '087788990011', email: 'rizky@example.com', points: 45, address: 'Bandung Central' },
  { id: 3, name: 'Budi Santoso', phone: '081399887766', email: 'budi@example.com', points: 210, address: 'Jakarta Barat' },
  { id: 4, name: 'Siti Nurhaliza', phone: '085211223344', email: 'siti@example.com', points: 340, address: 'Surabaya Timur' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [adjustingPointsCustomer, setAdjustingPointsCustomer] = useState<Customer | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    points: 0,
  });

  const [pointsChange, setPointsChange] = useState<number>(10);
  const [pointsMode, setPointsMode] = useState<'add' | 'subtract'>('add');

  // Load Customers (API + LocalStorage Fallback)
  const loadCustomers = async () => {
    try {
      const res = await api.get('/customers');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCustomers(res.data.data);
        localStorage.setItem('simako_customers', JSON.stringify(res.data.data));
        return;
      }
    } catch (e) {
      console.log('Using local storage fallback for customers');
    }

    try {
      const saved = localStorage.getItem('simako_customers');
      if (saved) {
        setCustomers(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_customers', JSON.stringify(initialCustomers));
        setCustomers(initialCustomers);
      }
    } catch (e) {
      setCustomers(initialCustomers);
    }
  };

  useEffect(() => {
    loadCustomers();
    window.addEventListener('storage', loadCustomers);
    return () => window.removeEventListener('storage', loadCustomers);
  }, []);

  const saveCustomers = async (updatedList: Customer[], message: string) => {
    setCustomers(updatedList);
    localStorage.setItem('simako_customers', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
    
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: Date.now(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      points: Number(formData.points) || 0,
    };

    try {
      await api.post('/customers', newCustomer);
    } catch (err) {
      console.log('Backend sync skipped, local state updated');
    }

    const updated = [newCustomer, ...customers];
    saveCustomers(updated, `Customer '${newCustomer.name}' berhasil ditambahkan!`);
    
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', email: '', address: '', points: 0 });
  };

  // UPDATE (EDIT)
  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      points: c.points,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const updatedCustomer: Customer = {
      ...editingCustomer,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      points: Number(formData.points) || 0,
    };

    try {
      await api.put(`/customers/${editingCustomer.id}`, updatedCustomer);
    } catch (err) {
      console.log('Backend update skipped, local state updated');
    }

    const updated = customers.map(c => (c.id === editingCustomer.id ? updatedCustomer : c));
    saveCustomers(updated, `Data customer '${updatedCustomer.name}' berhasil diperbarui!`);

    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '', points: 0 });
  };

  // DELETE
  const handleDelete = async () => {
    if (!deletingCustomer) return;

    try {
      await api.delete(`/customers/${deletingCustomer.id}`);
    } catch (err) {
      console.log('Backend delete skipped, local state updated');
    }

    const updated = customers.filter(c => c.id !== deletingCustomer.id);
    saveCustomers(updated, `Customer '${deletingCustomer.name}' telah dihapus.`);
    setDeletingCustomer(null);
  };

  // ADJUST POINTS
  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingPointsCustomer) return;

    const delta = pointsMode === 'add' ? Math.abs(pointsChange) : -Math.abs(pointsChange);
    const newPoints = Math.max(0, adjustingPointsCustomer.points + delta);

    const updatedCustomer: Customer = {
      ...adjustingPointsCustomer,
      points: newPoints,
    };

    try {
      await api.put(`/customers/${adjustingPointsCustomer.id}`, updatedCustomer);
    } catch (err) {
      console.log('Backend points update skipped, local state updated');
    }

    const updated = customers.map(c => (c.id === adjustingPointsCustomer.id ? updatedCustomer : c));
    const actionText = pointsMode === 'add' ? `+${pointsChange}` : `-${pointsChange}`;
    saveCustomers(updated, `Points '${adjustingPointsCustomer.name}' disesuaikan (${actionText} Poin).`);

    setAdjustingPointsCustomer(null);
    setPointsChange(10);
  };

  // FILTER SEARCH
  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const totalPoints = customers.reduce((acc, c) => acc + (c.points || 0), 0);
  const avgPoints = customers.length > 0 ? Math.round(totalPoints / customers.length) : 0;

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in text-gray-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold shadow-xs">
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
            <Users className="w-6 h-6 text-blue-600" />
            <span>Direktori Pelanggan & Loyalty Points</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Kelola profil customer, ubah data & poin reward transaksi</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={() => {
            setFormData({ name: '', phone: '', email: '', address: '', points: 0 });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Customer Baru</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Customer Registered</p>
            <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{customers.length} Orang</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Loyalty Points Beredar</p>
            <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{totalPoints.toLocaleString('id-ID')} Poin</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Rata-rata Poin / Customer</p>
            <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{avgPoints} Poin</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Nama, No HP, Email, atau Lokasi..."
            className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 font-medium px-2">
          Menampilkan <span className="font-bold text-gray-700">{filteredCustomers.length}</span> dari {customers.length} customer
        </p>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">Nama Customer</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Loyalty Points</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm">Tidak ada customer ditemukan</p>
                    <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian Anda</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-900">{c.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: #{c.id}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-gray-600 text-xs">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {c.phone || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {c.email || '-'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{c.address || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold border border-blue-100 inline-flex items-center gap-1.5 text-xs shadow-2xs">
                          <Award className="w-4 h-4 text-blue-600" /> {c.points} Poin
                        </span>
                        <button
                          onClick={() => {
                            setAdjustingPointsCustomer(c);
                            setPointsChange(10);
                            setPointsMode('add');
                          }}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 transition-colors inline-flex items-center gap-1"
                          title="Tambah/Kurang Poin"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>+/- Poin</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCustomer(c)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Customer"
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

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-xs max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Tambah Customer Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Customer <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dewi Sartika"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lokasi / Alamat</label>
                <textarea
                  rows={2}
                  placeholder="Jakarta Barat"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Loyalty Points Awal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.points === 0 || (formData.points as any) === '' ? '' : formData.points}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                    setFormData({ ...formData, points: val === '' ? ('' as any) : Number(val) });
                  }}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-bold"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm transition-all active:scale-95"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-xs max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Edit Data Customer
              </h3>
              <button onClick={() => setEditingCustomer(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Customer <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lokasi / Alamat</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Total Loyalty Points</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.points === 0 || (formData.points as any) === '' ? '' : formData.points}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                    setFormData({ ...formData, points: val === '' ? ('' as any) : Number(val) });
                  }}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-bold"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST POINTS MODAL */}
      {adjustingPointsCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Penyesuaian Loyalty Points
              </h3>
              <button onClick={() => setAdjustingPointsCustomer(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">{adjustingPointsCustomer.name}</p>
                <p className="text-[11px] text-gray-500">Poin Saat Ini:</p>
              </div>
              <span className="font-extrabold text-blue-700 text-base">{adjustingPointsCustomer.points} Poin</span>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Jenis Operasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPointsMode('add')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      pointsMode === 'add' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> Tambah (+ Poin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointsMode('subtract')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      pointsMode === 'subtract' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" /> Kurangi (- Poin)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Jumlah Poin</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={pointsChange === 0 || (pointsChange as any) === '' ? '' : pointsChange}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                    setPointsChange(val === '' ? ('' as any) : Number(val));
                  }}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-center font-extrabold text-base text-gray-900"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-1.5 justify-center">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPointsChange(val)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-[11px] text-gray-700"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustingPointsCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-extrabold shadow-xs ${
                    pointsMode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Simpan Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-center text-xs max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-gray-900">Konfirmasi Hapus Customer</h3>
              <p className="text-gray-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus data customer <span className="font-extrabold text-gray-900">"{deletingCustomer.name}"</span>?
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm transition-all active:scale-95"
              >
                Ya, Hapus Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
