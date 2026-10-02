'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SystemNotification {
  id: string;
  type: 'kitchen' | 'inventory_deduction' | 'low_stock' | 'order' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'is_read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const initialSeedNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    type: 'kitchen',
    title: 'Order Dapur Baru #ORD-002',
    message: 'Pesanan Meja Outdoor 01 (Beef Burger & Croissant) dikirim ke Dapur.',
    timestamp: '2 menit lalu',
    is_read: false,
  },
  {
    id: 'notif-2',
    type: 'inventory_deduction',
    title: 'Pengurangan Stok Bahan Otomatis',
    message: 'Stok Arabica Beans berkurang 0.04kg & Fresh Milk 0.3L untuk Order #ORD-001.',
    timestamp: '6 menit lalu',
    is_read: false,
  },
  {
    id: 'notif-3',
    type: 'low_stock',
    title: 'Peringatan Stok Menipis!',
    message: 'Stok Vanilla Syrup 750ml tersisa 2 botol (Di bawah batas min 3 botol).',
    timestamp: '15 menit lalu',
    is_read: false,
  },
  {
    id: 'notif-4',
    type: 'payment',
    title: 'Pembayaran Diterima',
    message: 'Pembayaran #ORD-003 sebesar Rp 34.000 (QRIS) berhasil diselesaikan.',
    timestamp: '25 menit lalu',
    is_read: true,
  },
];

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllAsRead: () => {},
  markAsRead: () => {},
  clearNotifications: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem('simako_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        localStorage.setItem('simako_notifications', JSON.stringify(initialSeedNotifications));
        setNotifications(initialSeedNotifications);
      }
    } catch (e) {
      console.error(e);
      setNotifications(initialSeedNotifications);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'simako_notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveToStorage = (updated: SystemNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('simako_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const addNotification = (notifData: Omit<SystemNotification, 'id' | 'timestamp' | 'is_read'>) => {
    const newNotif: SystemNotification = {
      ...notifData,
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: 'Baru saja',
      is_read: false,
    };
    const updated = [newNotif, ...notifications];
    saveToStorage(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    saveToStorage(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    saveToStorage(updated);
  };

  const clearNotifications = () => {
    saveToStorage([]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
