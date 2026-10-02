'use client';

import React, { useState, useEffect } from 'react';
import { Grid2X2, Plus, QrCode, Users, Eye, Printer, Edit, Trash2, X, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export interface RestaurantTable {
  id: number;
  name: string;
  code: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  area: 'Indoor' | 'Outdoor' | 'VIP' | string;
  qr_code: string;
}

const initialTables: RestaurantTable[] = [
  { id: 1, name: 'Table 01', code: 'T01', capacity: 2, status: 'available', area: 'Indoor', qr_code: 'T01-QR881' },
  { id: 2, name: 'Table 02', code: 'T02', capacity: 4, status: 'occupied', area: 'Indoor', qr_code: 'T02-QR992' },
  { id: 3, name: 'Table 03', code: 'T03', capacity: 4, status: 'available', area: 'Indoor', qr_code: 'T03-QR773' },
  { id: 4, name: 'Table 04', code: 'T04', capacity: 6, status: 'reserved', area: 'Indoor', qr_code: 'T04-QR664' },
  { id: 5, name: 'Outdoor 01', code: 'OUT01', capacity: 4, status: 'available', area: 'Outdoor', qr_code: 'OUT01-QR11' },
  { id: 6, name: 'Outdoor 02', code: 'OUT02', capacity: 4, status: 'occupied', area: 'Outdoor', qr_code: 'OUT02-QR22' },
  { id: 7, name: 'VIP Lounge 1', code: 'VIP01', capacity: 8, status: 'available', area: 'VIP', qr_code: 'VIP01-QR99' },
];

const areaList = ['all', 'Indoor', 'Outdoor', 'VIP'];

export default function TableManagementPage() {
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [activeArea, setActiveArea] = useState('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [origin, setOrigin] = useState('http://localhost:3000');

  // Modals
  const [selectedQrTable, setSelectedQrTable] = useState<RestaurantTable | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [deletingTable, setDeletingTable] = useState<RestaurantTable | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 4,
    area: 'Indoor',
    status: 'available' as 'available' | 'occupied' | 'reserved',
  });

  const loadTables = () => {
    try {
      const saved = localStorage.getItem('simako_tables');
      if (saved) {
        setTables(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_tables', JSON.stringify(initialTables));
        setTables(initialTables);
      }
    } catch (e) {
      console.error(e);
      setTables(initialTables);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    loadTables();
    window.addEventListener('storage', loadTables);
    return () => window.removeEventListener('storage', loadTables);
  }, []);

  const saveTables = (updated: RestaurantTable[], msg: string) => {
    setTables(updated);
    localStorage.setItem('simako_tables', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openCreateModal = () => {
    setEditingTable(null);
    setFormData({
      name: '',
      code: 'T0' + (tables.length + 1),
      capacity: 4,
      area: 'Indoor',
      status: 'available',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (t: RestaurantTable) => {
    setEditingTable(t);
    setFormData({
      name: t.name,
      code: t.code,
      capacity: t.capacity,
      area: t.area,
      status: t.status,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      // UPDATE
      const updated = tables.map(t =>
        t.id === editingTable.id ? { ...t, ...formData } : t
      );
      saveTables(updated, `Data '${formData.name}' berhasil diperbarui!`);
    } else {
      // CREATE
      const newTable: RestaurantTable = {
        id: Date.now(),
        ...formData,
        qr_code: formData.code + '-QR' + Math.floor(100 + Math.random() * 900),
      };
      const updated = [...tables, newTable];
      saveTables(updated, `Meja baru '${formData.name}' berhasil ditambahkan!`);
    }
    setIsFormModalOpen(false);
  };

  const toggleTableStatus = (id: number, nextStatus: 'available' | 'occupied' | 'reserved') => {
    const updated = tables.map(t => (t.id === id ? { ...t, status: nextStatus } : t));
    const target = updated.find(t => t.id === id);
    saveTables(updated, `Status '${target?.name}' diubah menjadi ${nextStatus.toUpperCase()}.`);
  };

  const handleDeleteTable = () => {
    if (!deletingTable) return;
    const updated = tables.filter(t => t.id !== deletingTable.id);
    saveTables(updated, `Meja '${deletingTable.name}' telah dihapus.`);
    setDeletingTable(null);
  };

  const filteredTables = tables.filter(t => {
    const matchesArea = activeArea === 'all' || t.area === activeArea;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.code.toLowerCase().includes(search.toLowerCase());
    return matchesArea && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'occupied':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'reserved':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in text-gray-900">
      {/* Toast Alert Banner */}
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
            <Grid2X2 className="w-6 h-6 text-blue-600" />
            <span>Table & QR Code Management</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Monitor denah meja real-time, kelola & generate QR Code Menu Pelanggan</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Meja Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {areaList.map((a) => (
            <button
              suppressHydrationWarning
              key={a}
              onClick={() => setActiveArea(a)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                activeArea === a
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {a === 'all' ? 'Semua Area' : a}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64 shrink-0 flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / kode meja..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
          />
        </div>
      </div>

      {/* Table Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            Tidak ada meja ditemukan di area ini
          </div>
        ) : (
          filteredTables.map((t) => (
            <div
              key={t.id}
              className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between transition-all hover:shadow-md ${
                t.status === 'occupied' ? 'border-amber-200 bg-amber-50/20' : 'hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">{t.area} • {t.code}</span>
                  <h3 className="font-bold text-base text-gray-900">{t.name}</h3>
                </div>
                
                {/* Status Selector Dropdown */}
                <select
                  value={t.status}
                  onChange={e => toggleTableStatus(t.id, e.target.value as any)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border focus:outline-none cursor-pointer ${getStatusBadge(t.status)}`}
                >
                  <option value="available">AVAILABLE</option>
                  <option value="occupied">OCCUPIED</option>
                  <option value="reserved">RESERVED</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{t.capacity} Kursi</span>
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    suppressHydrationWarning
                    onClick={() => setSelectedQrTable(t)}
                    className="flex items-center gap-1 text-blue-600 font-bold hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors text-xs"
                    title="Lihat QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR</span>
                  </button>

                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Meja"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={() => setDeletingTable(t)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus Meja"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT TABLE MODAL (SCROLLBAR FREE) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl space-y-4 animate-fade-in text-sm max-h-[94vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-3">
                <Grid2X2 className="w-6 h-6 text-blue-600" />
                {editingTable ? 'Edit Data Meja Resto' : 'Tambah Meja Baru'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-sm text-gray-800 block mb-1.5">Nama Meja</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold"
                  placeholder="e.g. Table 05 / Outdoor 03 / VIP Lounge 2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Kode Meja</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 font-mono text-sm font-bold"
                    placeholder="T05"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Kapasitas Kursi (Orang)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.capacity === 0 || (formData.capacity as any) === '' ? '' : formData.capacity}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setFormData({ ...formData, capacity: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-extrabold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Area Lokasi</label>
                  <select
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-semibold cursor-pointer"
                  >
                    <option value="Indoor">Indoor Main Hall</option>
                    <option value="Outdoor">Outdoor Garden</option>
                    <option value="VIP">VIP Private Room</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-800 block mb-1.5">Status Awal Meja</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 text-sm font-bold cursor-pointer"
                  >
                    <option value="available">Available (Kosong)</option>
                    <option value="occupied">Occupied (Terisi)</option>
                    <option value="reserved">Reserved (Dipesan)</option>
                  </select>
                </div>
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
                  {editingTable ? 'Simpan Perubahan' : 'Tambah Meja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (SCROLLBAR FREE) */}
      {deletingTable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-2xl space-y-6 animate-fade-in text-center text-sm max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900">Konfirmasi Hapus Meja</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus meja <span className="font-extrabold text-gray-900">"{deletingTable.name}"</span>?
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setDeletingTable(null)}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTable}
                className="px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                Ya, Hapus Meja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE VIEWER MODAL (SCROLLBAR FREE) */}
      {selectedQrTable && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:hidden overflow-hidden">
            <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xl text-center space-y-5 animate-fade-in text-sm max-h-[94vh] overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-gray-900">{selectedQrTable.name}</h3>
                <p className="text-xs text-gray-500 font-medium">Scan QR Code ini untuk Self-Order Menu di Meja</p>
              </div>

              {/* Rendered Real QR Code */}
              <div className="p-5 bg-gray-50 rounded-3xl inline-block border border-gray-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${origin}/qr-menu/${selectedQrTable.code}`)}`}
                  alt="QR Code Meja"
                  className="w-44 h-44 mx-auto rounded-xl shadow-sm"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 text-xs text-gray-500 font-mono truncate border border-gray-200 font-semibold">
                URL: {origin}/qr-menu/{selectedQrTable.code}
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedQrTable(null)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak QR</span>
                </button>
                <a
                  href={`/qr-menu/${selectedQrTable.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Buka Link</span>
                </a>
              </div>
            </div>
          </div>

          {/* Print-Only QR Code Card */}
          <div id="qr-print-card" className="hidden print:flex flex-col items-center justify-center border-4 border-double border-black p-8 rounded-3xl text-center space-y-6 max-w-sm mx-auto bg-white">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-black">SIMAKO RESTO</h2>
              <p className="text-[10px] text-black font-bold uppercase tracking-widest">Self-Order Menu Digital</p>
            </div>
            
            <div className="p-4 bg-white rounded-2xl border border-gray-300 inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${origin}/qr-menu/${selectedQrTable.code}`)}`}
                alt="QR Code Meja Print"
                className="w-48 h-48"
              />
            </div>

            <div className="space-y-2">
              <span className="px-5 py-2 rounded-lg bg-black text-white font-black text-xl tracking-wider block uppercase">
                {selectedQrTable.name}
              </span>
              <p className="text-[9px] text-black font-semibold leading-relaxed">Scan QR Code di atas menggunakan kamera handphone Anda untuk melihat menu & langsung memesan.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
