'use client';

import React, { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/api';
import { Coffee, Plus, Search, Edit, Trash2, CheckCircle2, Utensils, X, AlertTriangle } from 'lucide-react';

export interface MenuItem {
  id: number;
  category: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  is_available: boolean;
  is_kitchen_item: boolean;
  image: string;
}

const initialMenus: MenuItem[] = [
  { id: 1, category: 'coffee', name: 'Espresso Single', code: 'CF-001', price: 20000, stock: 150, is_available: true, is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80' },
  { id: 2, category: 'coffee', name: 'Caffè Latte', code: 'CF-002', price: 32000, stock: 120, is_available: true, is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80' },
  { id: 3, category: 'coffee', name: 'Caramel Macchiato', code: 'CF-003', price: 38000, stock: 90, is_available: true, is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80' },
  { id: 4, category: 'non-coffee', name: 'Matcha Latte Ice', code: 'NC-001', price: 34000, stock: 80, is_available: true, is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80' },
  { id: 5, category: 'food', name: 'Nasi Goreng Special POS', code: 'FD-001', price: 45000, stock: 50, is_available: true, is_kitchen_item: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80' },
  { id: 6, category: 'food', name: 'Beef Burger & Fries', code: 'FD-002', price: 55000, stock: 40, is_available: true, is_kitchen_item: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
  { id: 7, category: 'snacks', name: 'Truffle Parmesan Fries', code: 'SN-001', price: 28000, stock: 100, is_available: true, is_kitchen_item: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80' },
  { id: 8, category: 'dessert', name: 'Butter Croissant', code: 'DS-001', price: 24000, stock: 30, is_available: true, is_kitchen_item: true, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80' },
];

const categories = [
  { id: 'all', label: 'Semua Menu' },
  { id: 'coffee', label: 'Coffee & Espresso' },
  { id: 'non-coffee', label: 'Non-Coffee & Tea' },
  { id: 'food', label: 'Main Courses' },
  { id: 'snacks', label: 'Snacks & Bites' },
  { id: 'dessert', label: 'Desserts' },
];

export default function MasterMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'coffee',
    price: 30000,
    stock: 50,
    is_kitchen_item: true,
    image: '',
  });

  const loadMenus = () => {
    try {
      const saved = localStorage.getItem('simako_menus');
      if (saved) {
        setMenus(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_menus', JSON.stringify(initialMenus));
        setMenus(initialMenus);
      }
    } catch (e) {
      console.error(e);
      setMenus(initialMenus);
    }
  };

  useEffect(() => {
    loadMenus();
    window.addEventListener('storage', loadMenus);
    return () => window.removeEventListener('storage', loadMenus);
  }, []);

  const saveMenus = (updated: MenuItem[], msg: string) => {
    setMenus(updated);
    localStorage.setItem('simako_menus', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openCreateModal = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      code: 'MN-00' + (menus.length + 1),
      category: 'coffee',
      price: 30000,
      stock: 50,
      is_kitchen_item: true,
      image: '',
    });
    setShowModal(true);
  };

  const openEditModal = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      code: menu.code,
      category: menu.category,
      price: menu.price,
      stock: menu.stock,
      is_kitchen_item: menu.is_kitchen_item,
      image: menu.image,
    });
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultImg = 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80';

    if (editingMenu) {
      // UPDATE
      const updated = menus.map(m =>
        m.id === editingMenu.id
          ? {
              ...m,
              ...formData,
              image: formData.image || defaultImg,
            }
          : m
      );
      saveMenus(updated, `Menu '${formData.name}' berhasil diperbarui!`);
    } else {
      // CREATE
      const newMenu: MenuItem = {
        id: Date.now(),
        ...formData,
        is_available: true,
        image: formData.image || defaultImg,
      };
      saveMenus([newMenu, ...menus], `Menu baru '${formData.name}' berhasil ditambahkan!`);
    }
    setShowModal(false);
  };

  const toggleAvailability = (id: number) => {
    const updated = menus.map(m => (m.id === id ? { ...m, is_available: !m.is_available } : m));
    const target = updated.find(m => m.id === id);
    const statusText = target?.is_available ? 'TERSEDIA' : 'TIDAK TERSEDIA / HABIS';
    saveMenus(updated, `Status '${target?.name}' diubah menjadi ${statusText}.`);
  };

  const handleDeleteMenu = () => {
    if (!deletingMenu) return;
    const updated = menus.filter(m => m.id !== deletingMenu.id);
    saveMenus(updated, `Menu '${deletingMenu.name}' telah dihapus.`);
    setDeletingMenu(null);
  };

  const filteredMenus = menus.filter(m => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-gray-900 animate-fade-in">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-500" />
            <span>Master Data Menu Resto & Coffee</span>
          </h1>
          <p className="text-xs text-gray-400">Kelola harga, stok, ketersediaan & jenis item dapur/barista</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === c.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode / nama menu..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMenus.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            Tidak ada menu yang sesuai kriteria pencarian
          </div>
        ) : (
          filteredMenus.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between group hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div className="relative h-40 overflow-hidden bg-gray-100">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] font-mono text-amber-400 border border-white/10 font-bold">
                    {m.code}
                  </span>
                  {m.is_kitchen_item && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-600/90 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                      <Utensils className="w-3 h-3" /> Kitchen
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleAvailability(m.id)}
                  className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-extrabold backdrop-blur-xs transition-all shadow-sm ${
                    m.is_available ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {m.is_available ? 'Tersedia' : 'Habis'}
                </button>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{m.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-extrabold text-base">{formatRupiah(m.price)}</span>
                  <span className="text-[11px] text-gray-400 font-mono font-semibold">Stok: {m.stock} pcs</span>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-500 font-medium capitalize">{m.category}</span>
                
                <div className="flex items-center gap-2">
                  {/* TOGGLE SWITCH ON/OFF (TERSEDIA / TIDAK TERSEDIA) - POSITIONED TO THE LEFT OF EDIT */}
                  <button
                    type="button"
                    onClick={() => toggleAvailability(m.id)}
                    title={m.is_available ? 'Menu Tersedia (Klik untuk Nonaktifkan)' : 'Menu Tidak Tersedia (Klik untuk Aktifkan)'}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      m.is_available ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        m.is_available ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Menu"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingMenu(m)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MENU MODAL (SCROLLBAR FREE) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-sm max-h-[94vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-3">
                <Coffee className="w-6 h-6 text-amber-500" />
                {editingMenu ? 'Edit Menu Resto & Coffee' : 'Tambah Menu Resto Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-sm text-gray-800 block mb-1.5">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 text-sm font-semibold"
                  placeholder="e.g. Avocado Coffee Float"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Kode SKU Menu</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 font-mono text-sm font-bold"
                    placeholder="CF-006"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 text-sm font-semibold cursor-pointer"
                  >
                    <option value="coffee">Coffee & Espresso</option>
                    <option value="non-coffee">Non-Coffee & Tea</option>
                    <option value="food">Main Courses</option>
                    <option value="snacks">Snacks & Bites</option>
                    <option value="dessert">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Harga Jual (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.price === 0 || (formData.price as any) === '' ? '' : formData.price}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setFormData({ ...formData, price: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 text-sm font-extrabold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Stok Awal (Pcs)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.stock === 0 || (formData.stock as any) === '' ? '' : formData.stock}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setFormData({ ...formData, stock: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 text-sm font-extrabold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-sm text-gray-800 block mb-1.5">URL Gambar (Opsional)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 text-sm font-semibold"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <input
                  type="checkbox"
                  id="kitchen_flag"
                  checked={formData.is_kitchen_item}
                  onChange={e => setFormData({ ...formData, is_kitchen_item: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded-lg cursor-pointer"
                />
                <label htmlFor="kitchen_flag" className="text-xs sm:text-sm font-bold text-gray-800 cursor-pointer">
                  Kirim ke Kitchen Display (Pesanan yang perlu dibuat oleh Barista/Dapur)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  {editingMenu ? 'Simpan Perubahan' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MENU MODAL (SCROLLBAR FREE) */}
      {deletingMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-2xl space-y-6 animate-fade-in text-center text-sm max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900">Konfirmasi Hapus Menu</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus menu <span className="font-extrabold text-gray-900">"{deletingMenu.name}"</span>?
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setDeletingMenu(null)}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMenu}
                className="px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                Ya, Hapus Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
