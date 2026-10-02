'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '@/lib/api';

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Gayo Coffee Roasters', contact_person: 'Pak Hendra', phone: '082199887766', email: 'supply@gayocoffee.com', address: 'Aceh Tengah' },
  { id: 2, name: 'PT Fresh Dairy Nusantara', contact_person: 'Ibu Maria', phone: '085544332211', email: 'orders@freshdairy.co.id', address: 'Bogor' },
  { id: 3, name: 'Indo Bumbu & Sembako Ltd', contact_person: 'Pak David', phone: '081255443322', email: 'david@indobumbu.com', address: 'Jakarta Barat' },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });

  const loadSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSuppliers(res.data.data);
        localStorage.setItem('simako_suppliers', JSON.stringify(res.data.data));
        return;
      }
    } catch (e) {
      console.log('Using local storage fallback for suppliers');
    }

    try {
      const saved = localStorage.getItem('simako_suppliers');
      if (saved) {
        setSuppliers(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_suppliers', JSON.stringify(initialSuppliers));
        setSuppliers(initialSuppliers);
      }
    } catch (e) {
      setSuppliers(initialSuppliers);
    }
  };

  useEffect(() => {
    loadSuppliers();
    window.addEventListener('storage', loadSuppliers);
    return () => window.removeEventListener('storage', loadSuppliers);
  }, []);

  const saveSuppliers = (updatedList: Supplier[], message: string) => {
    setSuppliers(updatedList);
    localStorage.setItem('simako_suppliers', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
    
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: Date.now(),
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
    };

    try {
      await api.post('/suppliers', newSupplier);
    } catch (err) {
      console.log('Backend sync skipped, local state updated');
    }

    const updated = [newSupplier, ...suppliers];
    saveSuppliers(updated, `Supplier '${newSupplier.name}' berhasil ditambahkan!`);

    setIsAddModalOpen(false);
    setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
  };

  // EDIT
  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contact_person: s.contact_person,
      phone: s.phone,
      email: s.email,
      address: s.address,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    const updatedSupplier: Supplier = {
      ...editingSupplier,
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
    };

    try {
      await api.put(`/suppliers/${editingSupplier.id}`, updatedSupplier);
    } catch (err) {
      console.log('Backend sync skipped, local state updated');
    }

    const updated = suppliers.map(s => (s.id === editingSupplier.id ? updatedSupplier : s));
    saveSuppliers(updated, `Data supplier '${updatedSupplier.name}' berhasil diperbarui!`);

    setEditingSupplier(null);
    setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
  };

  // DELETE
  const handleDelete = async () => {
    if (!deletingSupplier) return;

    try {
      await api.delete(`/suppliers/${deletingSupplier.id}`);
    } catch (err) {
      console.log('Backend sync skipped, local state updated');
    }

    const updated = suppliers.filter(s => s.id !== deletingSupplier.id);
    saveSuppliers(updated, `Supplier '${deletingSupplier.name}' telah dihapus.`);
    setDeletingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.contact_person.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

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
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Manajemen Supplier Vendor</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Pemasok bahan baku kopi, dairy, makanan & packaging</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={() => {
            setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Supplier Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Supplier, PIC, Telepon, Alamat..."
            className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 font-medium px-2">
          Menampilkan <span className="font-bold text-gray-700">{filteredSuppliers.length}</span> dari {suppliers.length} supplier
        </p>
      </div>

      {/* Grid Suppliers */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs text-gray-400">
          <Building2 className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium text-sm">Tidak ada supplier ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-blue-200 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">{s.name}</h3>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-gray-400 shrink-0" /> PIC: {s.contact_person || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSupplier(s)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 pt-3 border-t border-gray-100 font-mono">
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {s.phone || '-'}</p>
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {s.email || '-'}</p>
                  <p className="flex items-center gap-2 text-gray-500 font-sans"><MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {s.address || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-xs max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Tambah Supplier Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Perusahaan / Supplier <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="PT Gayo Coffee Supply"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Contact Person (PIC)</label>
                <input
                  type="text"
                  placeholder="Pak Hendra"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  placeholder="082199887766"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="orders@supplier.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Alamat Supplier</label>
                <textarea
                  rows={2}
                  placeholder="Aceh Tengah"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
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
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-xs max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Edit Data Supplier
              </h3>
              <button onClick={() => setEditingSupplier(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Perusahaan / Supplier <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Contact Person (PIC)</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
                <label className="font-bold text-gray-700 block mb-1">Alamat Supplier</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
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

      {/* DELETE MODAL */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-center text-xs max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-gray-900">Konfirmasi Hapus Supplier</h3>
              <p className="text-gray-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus supplier <span className="font-extrabold text-gray-900">"{deletingSupplier.name}"</span>?
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingSupplier(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm transition-all active:scale-95"
              >
                Ya, Hapus Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
