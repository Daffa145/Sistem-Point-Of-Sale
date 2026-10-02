'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Filter,
  Users,
  Building2,
  CalendarDays
} from 'lucide-react';
import { api } from '@/lib/api';

export interface TableItem {
  id: number;
  name: string;
  code?: string;
  capacity: number;
  area: string;
  status: string;
}

export interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  table_id: number;
  table?: TableItem | null;
  table_name?: string;
  reservation_time: string;
  guest_count: number;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled';
  notes?: string | null;
}

const defaultTables: TableItem[] = [
  { id: 1, name: 'Table 01', code: 'T01', capacity: 4, area: 'Indoor', status: 'available' },
  { id: 2, name: 'Table 02', code: 'T02', capacity: 4, area: 'Indoor', status: 'available' },
  { id: 3, name: 'Table 03', code: 'T03', capacity: 4, area: 'Indoor', status: 'reserved' },
  { id: 4, name: 'Table 04', code: 'T04', capacity: 6, area: 'Indoor', status: 'reserved' },
  { id: 5, name: 'VIP Lounge 1', code: 'VIP1', capacity: 8, area: 'VIP Area', status: 'reserved' },
];

const initialReservations: Reservation[] = [
  { 
    id: 1, 
    customer_name: 'Dewi Sartika', 
    customer_phone: '081122334455', 
    table_id: 4, 
    table_name: 'Table 04 (Indoor)', 
    guest_count: 5, 
    reservation_time: '2026-08-13 13:00', 
    status: 'confirmed', 
    notes: 'Birthday celebration' 
  },
  { 
    id: 2, 
    customer_name: 'Budi Santoso', 
    customer_phone: '081399887766', 
    table_id: 5, 
    table_name: 'VIP Lounge 1', 
    guest_count: 8, 
    reservation_time: '2026-08-13 19:00', 
    status: 'pending', 
    notes: 'Corporate dinner' 
  },
];

/**
 * Helper to check if a reservation is past H+2 (2 days after reservation_time)
 */
const isExpiredHPlus2 = (reservationTimeStr: string): boolean => {
  if (!reservationTimeStr) return false;
  const resDate = new Date(reservationTimeStr).getTime();
  if (isNaN(resDate)) return false;
  // H+2 = 2 days = 48 hours = 48 * 3600 * 1000 ms
  const expiryTime = resDate + (2 * 24 * 60 * 60 * 1000);
  return Date.now() > expiryTime;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [tables, setTables] = useState<TableItem[]>(defaultTables);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    table_id: 3,
    guest_count: 2,
    reservation_time: '',
    status: 'confirmed' as 'pending' | 'confirmed' | 'seated' | 'cancelled',
    notes: '',
  });

  // Load Tables
  const loadTables = async () => {
    try {
      const res = await api.get('/tables');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTables(res.data.data);
      }
    } catch (e) {
      console.log('Using default table list');
    }
  };

  // Load Reservations with H+2 Auto-Deletion Filter
  const loadReservations = async () => {
    let rawList: Reservation[] = [];
    let fromApi = false;

    try {
      const res = await api.get('/reservations');
      if (res.data?.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
        fromApi = true;
      }
    } catch (e) {
      console.log('Using local storage fallback for reservations');
    }

    if (!fromApi) {
      try {
        const saved = localStorage.getItem('simako_reservations');
        if (saved) {
          rawList = JSON.parse(saved);
        } else {
          rawList = initialReservations;
          localStorage.setItem('simako_reservations', JSON.stringify(initialReservations));
        }
      } catch (e) {
        rawList = initialReservations;
      }
    }

    // Apply H+2 auto-deletion filter
    const activeReservations = rawList.filter(r => !isExpiredHPlus2(r.reservation_time));
    const expiredCount = rawList.length - activeReservations.length;

    setReservations(activeReservations);
    localStorage.setItem('simako_reservations', JSON.stringify(activeReservations));

    if (expiredCount > 0) {
      showToast(`ℹ️ ${expiredCount} reservasi yang sudah H+2 otomatis dibersihkan oleh sistem.`);
    }
  };

  useEffect(() => {
    loadTables();
    loadReservations();
    window.addEventListener('storage', loadReservations);
    return () => window.removeEventListener('storage', loadReservations);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const syncStateAndLocal = (updated: Reservation[], msg: string) => {
    // Also strip out any expired just in case
    const cleaned = updated.filter(r => !isExpiredHPlus2(r.reservation_time));
    setReservations(cleaned);
    localStorage.setItem('simako_reservations', JSON.stringify(cleaned));
    window.dispatchEvent(new Event('storage'));
    showToast(msg);
  };

  // CREATE
  const openAddModal = () => {
    const defaultTableId = tables[0]?.id || 1;
    // Default time: today formatted as YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const formattedNow = now.toISOString().slice(0, 16);

    setFormData({
      customer_name: '',
      customer_phone: '',
      table_id: defaultTableId,
      guest_count: 2,
      reservation_time: formattedNow,
      status: 'confirmed',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTable = tables.find(t => t.id === Number(formData.table_id));
    const tableName = selectedTable ? `${selectedTable.name} (${selectedTable.area})` : `Table ${formData.table_id}`;

    const newRes: Reservation = {
      id: Date.now(),
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      table_id: Number(formData.table_id),
      table: selectedTable || null,
      table_name: tableName,
      guest_count: Number(formData.guest_count) || 2,
      reservation_time: formData.reservation_time.replace('T', ' '),
      status: formData.status,
      notes: formData.notes.trim(),
    };

    try {
      await api.post('/reservations', {
        customer_name: newRes.customer_name,
        customer_phone: newRes.customer_phone,
        table_id: newRes.table_id,
        reservation_time: newRes.reservation_time,
        guest_count: newRes.guest_count,
        status: newRes.status,
        notes: newRes.notes,
      });
    } catch (err) {
      console.log('Backend sync skipped, local state updated');
    }

    const updated = [newRes, ...reservations];
    syncStateAndLocal(updated, `Reservasi untuk '${newRes.customer_name}' berhasil ditambahkan!`);
    setIsAddModalOpen(false);
  };

  // EDIT
  const openEditModal = (r: Reservation) => {
    setEditingReservation(r);
    // Format datetime string for datetime-local input (YYYY-MM-DDTHH:mm)
    let formattedTime = r.reservation_time.replace(' ', 'T');
    if (formattedTime.length > 16) {
      formattedTime = formattedTime.slice(0, 16);
    }

    setFormData({
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      table_id: r.table_id || (tables[0]?.id || 1),
      guest_count: r.guest_count,
      reservation_time: formattedTime,
      status: r.status,
      notes: r.notes || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReservation) return;

    const selectedTable = tables.find(t => t.id === Number(formData.table_id));
    const tableName = selectedTable ? `${selectedTable.name} (${selectedTable.area})` : `Table ${formData.table_id}`;

    const updatedRes: Reservation = {
      ...editingReservation,
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      table_id: Number(formData.table_id),
      table: selectedTable || null,
      table_name: tableName,
      guest_count: Number(formData.guest_count) || 2,
      reservation_time: formData.reservation_time.replace('T', ' '),
      status: formData.status,
      notes: formData.notes.trim(),
    };

    try {
      await api.put(`/reservations/${editingReservation.id}`, {
        customer_name: updatedRes.customer_name,
        customer_phone: updatedRes.customer_phone,
        table_id: updatedRes.table_id,
        reservation_time: updatedRes.reservation_time,
        guest_count: updatedRes.guest_count,
        status: updatedRes.status,
        notes: updatedRes.notes,
      });
    } catch (err) {
      console.log('Backend sync skipped, local state updated');
    }

    const updatedList = reservations.map(r => r.id === editingReservation.id ? updatedRes : r);
    syncStateAndLocal(updatedList, `Reservasi '${updatedRes.customer_name}' berhasil diperbarui!`);
    setEditingReservation(null);
  };

  // DELETE
  const handleDelete = async () => {
    if (!deletingReservation) return;

    try {
      await api.delete(`/reservations/${deletingReservation.id}`);
    } catch (err) {
      console.log('Backend delete skipped, local state updated');
    }

    const updatedList = reservations.filter(r => r.id !== deletingReservation.id);
    syncStateAndLocal(updatedList, `Reservasi '${deletingReservation.customer_name}' telah dihapus.`);
    setDeletingReservation(null);
  };

  // QUICK STATUS CHANGE
  const handleQuickStatusChange = async (r: Reservation, newStatus: 'pending' | 'confirmed' | 'seated' | 'cancelled') => {
    const updatedRes: Reservation = { ...r, status: newStatus };

    try {
      await api.patch(`/reservations/${r.id}/status`, { status: newStatus });
    } catch (err) {
      console.log('Backend status update skipped, local state updated');
    }

    const updatedList = reservations.map(item => item.id === r.id ? updatedRes : item);
    syncStateAndLocal(updatedList, `Status reservasi '${r.customer_name}' diubah menjadi '${newStatus.toUpperCase()}'.`);
  };

  // FILTERED RESERVATIONS
  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    const tableName = r.table?.name || r.table_name || '';
    const matchesSearch = 
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_phone.toLowerCase().includes(search.toLowerCase()) ||
      tableName.toLowerCase().includes(search.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getTableName = (r: Reservation) => {
    if (r.table?.name) {
      return `${r.table.name} (${r.table.area || 'Indoor'})`;
    }
    return r.table_name || `Table ${r.table_id}`;
  };

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl border border-gray-800 text-xs animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>Manajemen Reservasi Meja</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Booking meja resto, konfirmasi jam kedatangan & jumlah tamu</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Reservasi Baru</span>
        </button>
      </div>

      {/* H+2 Auto Deletion Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-100 rounded-xl p-3.5 flex items-start sm:items-center gap-3 text-xs text-blue-900 shadow-sm">
        <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5 sm:mt-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 font-semibold text-blue-950">
            <span>Sistem Hapus Otomatis H+2 Aktif</span>
            <span className="bg-blue-200/80 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-mono">Auto Clean</span>
          </div>
          <p className="text-blue-700/80 mt-0.5 text-[11px]">
            Data reservasi yang telah melewati <strong>2 hari (H+2)</strong> dari tanggal/waktu reservasi akan secara otomatis dihapus oleh sistem untuk menjaga kerapian data booking.
          </p>
        </div>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pemesan, no hp, meja, atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 shrink-0">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: 'Pending' },
            { key: 'seated', label: 'Seated' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Meja Reserved</th>
                <th className="p-4">Jml Tamu</th>
                <th className="p-4">Waktu Booking</th>
                <th className="p-4">Status</th>
                <th className="p-4">Catatan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-gray-500">Tidak ada reservasi ditemukan</p>
                    <p className="text-[11px] mt-0.5">Coba ubah kata kunci pencarian atau filter status</p>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((r) => {
                  const tableName = getTableName(r);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Customer Info */}
                      <td className="p-4 font-semibold text-gray-900">
                        <p className="text-gray-900 group-hover:text-blue-600 transition-colors">{r.customer_name}</p>
                        <span className="text-[11px] text-gray-400 font-mono font-normal">{r.customer_phone}</span>
                      </td>

                      {/* Reserved Table */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{tableName}</span>
                        </div>
                      </td>

                      {/* Guest Count */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold text-[11px]">
                          <Users className="w-3 h-3 text-gray-400" />
                          {r.guest_count} Tamu
                        </span>
                      </td>

                      {/* Reservation Time */}
                      <td className="p-4 font-mono text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{r.reservation_time}</span>
                          <span className="text-[10px] text-blue-600">H+2 Auto Clean</span>
                        </div>
                      </td>

                      {/* Status Dropdown / Pill */}
                      <td className="p-4 uppercase font-semibold text-[10px]">
                        <select
                          value={r.status}
                          onChange={(e) => handleQuickStatusChange(r, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                            r.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : r.status === 'seated'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="confirmed">CONFIRMED</option>
                          <option value="pending">PENDING</option>
                          <option value="seated">SEATED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="p-4 text-gray-500 italic">
                        {r.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(r)}
                            title="Edit Reservasi"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingReservation(r)}
                            title="Hapus Reservasi"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Buat Reservasi Meja Baru</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-700 block mb-1">Nama Pemesan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dewi Sartika"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081122334455"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Pilih Meja</label>
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.area} - {t.capacity} Kursi)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Jumlah Tamu</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.guest_count === 0 || (formData.guest_count as any) === '' ? '' : formData.guest_count}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setFormData({ ...formData, guest_count: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Waktu & Tanggal Booking</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Status Awal</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 font-semibold"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="seated">Seated</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Birthday celebration, butuh baby chair"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20 transition-colors"
                >
                  Simpan Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Edit Data Reservasi</span>
              </h3>
              <button onClick={() => setEditingReservation(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-700 block mb-1">Nama Pemesan</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Pilih Meja</label>
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.area} - {t.capacity} Kursi)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Jumlah Tamu</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.guest_count === 0 || (formData.guest_count as any) === '' ? '' : formData.guest_count}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setFormData({ ...formData, guest_count: val === '' ? ('' as any) : Number(val) });
                    }}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Waktu & Tanggal Booking</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700 block mb-1">Status Reservasi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 font-semibold"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="seated">Seated</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingReservation(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900">Konfirmasi Hapus Reservasi</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus reservasi atas nama{' '}
                <strong className="text-gray-900">{deletingReservation.customer_name}</strong>?
              </p>
              <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-left text-xs text-gray-600 border border-gray-200 space-y-1">
                <p><strong>Meja:</strong> {getTableName(deletingReservation)}</p>
                <p><strong>Waktu:</strong> {deletingReservation.reservation_time}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReservation(null)}
                className="w-full py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm shadow-rose-600/20 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

