'use client';

import React, { useState } from 'react';
import { Users, Plus, Mail, Edit, Trash2, CheckCircle2, XCircle, Search, X, AlertTriangle } from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'kitchen' | 'waiter';
  phone: string;
  is_active: boolean;
}

const initialUsers: UserItem[] = [
  { id: 1, name: 'Admin Manager', email: 'admin@pos.com', role: 'admin', phone: '081234567890', is_active: true },
  { id: 2, name: 'Budi Cashier', email: 'cashier@pos.com', role: 'cashier', phone: '081298765432', is_active: true },
  { id: 3, name: 'Chef Alex', email: 'kitchen@pos.com', role: 'kitchen', phone: '081355556666', is_active: true },
  { id: 4, name: 'Siti Waiter', email: 'waiter@pos.com', role: 'waiter', phone: '081477778888', is_active: false },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'cashier' as UserItem['role'],
    phone: '',
    password: '',
    is_active: true,
  });

  // Confirm Delete Modal State
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // --- Handlers ---
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'cashier', phone: '', password: '', is_active: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserItem) => {
    setModalMode('edit');
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      password: '',
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const newUser: UserItem = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        is_active: formData.is_active,
      };
      setUsers([...users, newUser]);
      showNotification(`Pengguna "${newUser.name}" berhasil ditambahkan!`);
    } else if (modalMode === 'edit' && editingId !== null) {
      setUsers(users.map(u => (u.id === editingId ? {
        ...u,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        is_active: formData.is_active,
      } : u)));
      showNotification(`Data pengguna "${formData.name}" berhasil diperbarui!`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteModalId !== null) {
      const targetUser = users.find(u => u.id === deleteModalId);
      setUsers(users.filter(u => u.id !== deleteModalId));
      showNotification(`Pengguna "${targetUser?.name || 'User'}" berhasil dihapus.`);
      setDeleteModalId(null);
    }
  };

  const handleToggleStatus = (id: number) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextState = !u.is_active;
        showNotification(`Status "${u.name}" diubah menjadi ${nextState ? 'Aktif' : 'Non-Aktif'}.`);
        return { ...u, is_active: nextState };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cashier':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'kitchen':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-5 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button suppressHydrationWarning onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-100 rounded text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span>User Management</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola pengguna sistem POS (Admin, Kasir, Dapur, Waiter)</p>
        </div>

        <button
          suppressHydrationWarning
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengguna berdasarkan nama, email, role..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <span className="text-xs text-gray-400 font-medium">Total: {filteredUsers.length} Pengguna</span>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Role Akses</th>
                <th className="p-4">No. Telepon</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                          <p className="text-gray-400 text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-500">{u.phone || '-'}</td>
                    <td className="p-4">
                      <button
                        suppressHydrationWarning
                        onClick={() => handleToggleStatus(u.id)}
                        className="group flex items-center gap-1.5 focus:outline-none"
                        title="Klik untuk mengubah status"
                      >
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs group-hover:underline">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 font-medium text-xs group-hover:underline">
                            <XCircle className="w-3.5 h-3.5" /> Non-Aktif
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          suppressHydrationWarning
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          suppressHydrationWarning
                          onClick={() => setDeleteModalId(u.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                {modalMode === 'create' ? 'Tambah Pengguna POS Baru' : 'Edit Data Pengguna'}
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-gray-600 block mb-1">Nama Lengkap</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  placeholder="e.g. Maya Kasir"
                />
              </div>
              <div>
                <label className="font-medium text-gray-600 block mb-1">Email Address</label>
                <input
                  suppressHydrationWarning
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  placeholder="maya@pos.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-gray-600 block mb-1">Role Akses</label>
                  <select
                    suppressHydrationWarning
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserItem['role'] })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  >
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                    <option value="kitchen">Kitchen Chef</option>
                    <option value="waiter">Waiter</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-600 block mb-1">No. Telepon</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                    placeholder="08123456789"
                  />
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-600 block mb-1">
                  {modalMode === 'create' ? 'Password' : 'Password (opsional, kosongkan jika tak diubah)'}
                </label>
                <input
                  suppressHydrationWarning
                  type="password"
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  id="user_active_status"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="user_active_status" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Status Pengguna Aktif
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
                >
                  Batal
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
                >
                  {modalMode === 'create' ? 'Simpan User Baru' : 'Update Data User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteModalId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Konfirmasi Hapus</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                suppressHydrationWarning
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-xs text-gray-700"
              >
                Batal
              </button>
              <button
                suppressHydrationWarning
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-sm transition-colors"
              >
                Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
