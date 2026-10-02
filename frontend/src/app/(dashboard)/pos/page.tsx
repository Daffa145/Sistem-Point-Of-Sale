'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  UtensilsCrossed, Search, Plus, Minus, Trash2,
  Send, CreditCard, Coffee, CheckCircle2, Receipt,
  Printer, X, ChefHat, ShoppingCart, LogOut,
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  is_kitchen_item: boolean;
}

export interface MenuItem {
  id: number;
  category: string;
  name: string;
  code: string;
  price: number;
  stock?: number;
  is_available?: boolean;
  is_kitchen_item: boolean;
  image: string;
}

const initialMenus: MenuItem[] = [
  { id: 1, category: 'coffee',     name: 'Espresso Single',      code: 'CF-001', price: 20000, stock: 150, is_available: true,  is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
  { id: 2, category: 'coffee',     name: 'Caffè Latte',          code: 'CF-002', price: 32000, stock: 120, is_available: true,  is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
  { id: 3, category: 'coffee',     name: 'Caramel Macchiato',    code: 'CF-003', price: 38000, stock: 90,  is_available: true,  is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80' },
  { id: 4, category: 'non-coffee', name: 'Matcha Latte Ice',     code: 'NC-001', price: 34000, stock: 80,  is_available: true,  is_kitchen_item: false, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80' },
  { id: 5, category: 'food',       name: 'Nasi Goreng Special',  code: 'FD-001', price: 45000, stock: 50,  is_available: true,  is_kitchen_item: true,  image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' },
  { id: 6, category: 'food',       name: 'Beef Burger & Fries',  code: 'FD-002', price: 55000, stock: 40,  is_available: true,  is_kitchen_item: true,  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
  { id: 7, category: 'snacks',     name: 'Truffle Fries',        code: 'SN-001', price: 28000, stock: 100, is_available: true,  is_kitchen_item: true,  image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80' },
  { id: 8, category: 'dessert',    name: 'Butter Croissant',     code: 'DS-001', price: 24000, stock: 30,  is_available: true,  is_kitchen_item: true,  image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
];

const categories = [
  { id: 'all',        label: 'All' },
  { id: 'coffee',     label: 'Coffee' },
  { id: 'non-coffee', label: 'Non-Coffee' },
  { id: 'food',       label: 'Main Course' },
  { id: 'snacks',     label: 'Snacks' },
  { id: 'dessert',    label: 'Desserts' },
];

const getMaxCashLimit = (total: number) => {
  if (total <= 0) return 200000;
  const ceil50k = Math.ceil(total / 50000) * 50000;
  const ceil100k = Math.ceil(total / 100000) * 100000;
  if (ceil50k === total) {
    return Math.max(total, ceil100k > total ? ceil100k : total + 50000);
  }
  return ceil50k;
};

const getPresetAmounts = (total: number) => {
  if (total <= 0) return [50000, 100000, 150000, 200000];
  const pas = total;
  const round10k = Math.ceil(total / 10000) * 10000;
  const round50k = Math.ceil(total / 50000) * 50000;
  const maxLimit = getMaxCashLimit(total);

  const rawList = [pas, round10k, round50k, maxLimit];
  const uniqueList = Array.from(new Set(rawList)).filter(amt => amt >= total).sort((a, b) => a - b);
  return uniqueList;
};

export default function PosPage() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [orderType, setOrderType]   = useState<'dine_in' | 'takeaway'>('dine_in');
  const [selectedTable, setSelectedTable] = useState('T01');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal,  setShowPaymentModal]  = useState(false);
  const [showReceiptModal,  setShowReceiptModal]  = useState(false);
  const [paymentMethod,     setPaymentMethod]     = useState<'cash' | 'qris' | 'card'>('cash');
  const [cashGiven,         setCashGiven]         = useState<string>('');
  const [notification,      setNotification]      = useState('');

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

  React.useEffect(() => {
    loadMenus();
    window.addEventListener('storage', loadMenus);
    return () => window.removeEventListener('storage', loadMenus);
  }, []);

  const deductInventoryStock = (orderedCart: CartItem[], orderNum: string) => {
    try {
      const savedInventories = localStorage.getItem('simako_inventories');
      let inventories = savedInventories ? JSON.parse(savedInventories) : [
        { id: 1, item_name: 'Arabica Gayo Espresso Beans', sku: 'RAW-001', category: 'Raw Material', quantity: 25.5, unit: 'kg', min_stock: 5.0, unit_cost: 180000, supplier: 'Gayo Coffee Roasters' },
        { id: 2, item_name: 'Fresh Whole Milk 1L', sku: 'RAW-002', category: 'Beverage Base', quantity: 8, unit: 'liter', min_stock: 15, unit_cost: 19000, supplier: 'PT Fresh Dairy Nusantara' },
        { id: 3, item_name: 'Vanilla Syrup 750ml', sku: 'RAW-003', category: 'Beverage Base', quantity: 2, unit: 'bottle', min_stock: 3, unit_cost: 140000, supplier: 'Gayo Coffee Roasters' },
        { id: 4, item_name: 'Beras Premium 5kg', sku: 'RAW-004', category: 'Kitchen Supply', quantity: 40, unit: 'kg', min_stock: 10, unit_cost: 75000, supplier: 'Indo Bumbu & Sembako Ltd' },
      ];

      const deductedItemsSummary: string[] = [];

      orderedCart.forEach(item => {
        inventories = inventories.map((inv: any) => {
          let deductQty = 0;
          const itemNameLower = item.name.toLowerCase();
          const invNameLower = inv.item_name.toLowerCase();

          if (itemNameLower.includes('coffee') || itemNameLower.includes('latte') || itemNameLower.includes('espresso') || itemNameLower.includes('macchiato')) {
            if (invNameLower.includes('beans') || invNameLower.includes('arabica')) {
              deductQty = 0.02 * item.quantity; // 20g per cup
            } else if (invNameLower.includes('milk')) {
              deductQty = 0.15 * item.quantity; // 150ml per cup
            }
          } else if (itemNameLower.includes('nasi') || itemNameLower.includes('burger') || itemNameLower.includes('fries') || itemNameLower.includes('croissant')) {
            if (invNameLower.includes('beras') || invNameLower.includes('kitchen')) {
              deductQty = 0.2 * item.quantity; // 200g per portion
            }
          }

          if (deductQty > 0) {
            const newQty = Math.max(0, Math.round((inv.quantity - deductQty) * 100) / 100);
            deductedItemsSummary.push(`${inv.item_name} (-${deductQty}${inv.unit})`);

            // Low stock warning check
            if (newQty <= inv.min_stock && inv.quantity > inv.min_stock) {
              addNotification({
                type: 'low_stock',
                title: 'Peringatan Stok Menipis!',
                message: `Stok ${inv.item_name} tersisa ${newQty} ${inv.unit} (Di bawah batas min: ${inv.min_stock} ${inv.unit}).`,
              });
            }
            return { ...inv, quantity: newQty };
          }
          return inv;
        });
      });

      localStorage.setItem('simako_inventories', JSON.stringify(inventories));
      window.dispatchEvent(new Event('storage'));

      if (deductedItemsSummary.length > 0) {
        addNotification({
          type: 'inventory_deduction',
          title: 'Pengurangan Stok Bahan Otomatis',
          message: `Pengurangan stok bahan untuk #${orderNum}: ${deductedItemsSummary.join(', ')}.`,
        });
      }
    } catch (e) {
      console.error('Inventory deduction error:', e);
    }
  };

  const sendToKitchen = (isPaid: boolean = false) => {
    if (cart.length === 0) return;

    let currentOrders = [];
    try {
      const saved = localStorage.getItem('simako_orders');
      if (saved) {
        currentOrders = JSON.parse(saved);
      } else {
        currentOrders = [
          {
            id: 1, order_number: 'ORD-001', table: 'Table 02 — Indoor', time_elapsed: '6 min', status: 'cooking',
            notes: 'Less spicy on Nasi Goreng',
            items: [
              { name: 'Nasi Goreng Special', qty: 1, notes: 'Extra spicy' },
              { name: 'Truffle Fries',       qty: 1, notes: null },
            ],
          },
          {
            id: 2, order_number: 'ORD-002', table: 'Outdoor 01', time_elapsed: '2 min', status: 'queued',
            notes: 'Birthday table',
            items: [
              { name: 'Beef Burger & Fries', qty: 2, notes: 'Medium rare' },
              { name: 'Butter Croissant',   qty: 1, notes: 'Warmed up' },
            ],
          },
          {
            id: 3, order_number: 'ORD-003', table: 'Table 01', time_elapsed: '14 min', status: 'ready',
            notes: null,
            items: [
              { name: 'Spaghetti Carbonara', qty: 1, notes: 'Extra parmesan' },
            ],
          },
        ];
      }
    } catch (e) {
      console.error(e);
    }

    const tableLabel = selectedTable === 'T01' ? 'Table 01' : selectedTable === 'T02' ? 'Table 02' : selectedTable === 'T03' ? 'Table 03' : selectedTable;
    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      table: tableLabel,
      time_elapsed: '1 min',
      status: 'queued',
      notes: cart.map(c => c.notes).filter(Boolean).join(', ') || null,
      items: cart.map(c => ({
        name: c.name,
        qty: c.quantity,
        notes: c.notes || null
      }))
    };

    const updatedOrders = [newOrder, ...currentOrders];
    localStorage.setItem('simako_orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));

    // Perform Automatic Inventory Deduction
    deductInventoryStock(cart, orderNum);

    // Push Kitchen Notification
    addNotification({
      type: 'kitchen',
      title: `Order Dapur Baru #${orderNum}`,
      message: `Pesanan ${tableLabel} (${cart.map(c => `${c.name} x${c.quantity}`).join(', ')}) dikirim ke Dapur.`,
    });

    if (isPaid) {
      addNotification({
        type: 'payment',
        title: `Pembayaran Berhasil #${orderNum}`,
        message: `Pembayaran ${tableLabel} sebesar ${formatRupiah(grandTotal)} (${paymentMethod.toUpperCase()}) diterima.`,
      });
    }

    setNotification(isPaid ? 'Pesanan telah dibayar & dikirim ke Dapur!' : 'Pesanan berhasil dikirim ke Dapur!');
    setCart([]);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredMenus = menus.filter(m => {
    const cat  = activeCategory === 'all' || m.category === activeCategory;
    const srch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    return cat && srch;
  });

  const addToCart = (menu: MenuItem) => {
    if (menu.is_available === false || (menu.stock !== undefined && menu.stock <= 0)) {
      return;
    }
    const existing = cart.find(c => c.id === menu.id);
    if (existing) {
      setCart(cart.map(c => c.id === menu.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { id: menu.id, name: menu.name, price: menu.price, quantity: 1, is_kitchen_item: menu.is_kitchen_item }]);
    }
  };

  const updateQty = (id: number, delta: number) =>
    setCart(cart.map(c => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0) as CartItem[]);

  const updateNotes = (id: number, notes: string) =>
    setCart(cart.map(c => c.id === id ? { ...c, notes } : c));

  const subtotal      = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const tax           = Math.round(subtotal * 0.10);
  const service       = orderType === 'dine_in' ? Math.round(subtotal * 0.05) : 0;
  const grandTotal    = subtotal + tax + service;

  const maxCashLimit  = getMaxCashLimit(grandTotal);
  const numericCash   = Number(cashGiven) || 0;
  const changeAmount  = Math.max(0, numericCash - grandTotal);

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    let sanitized = rawVal.replace(/\D/g, '').replace(/^0+/, '');

    if (sanitized !== '') {
      const valNum = Number(sanitized);
      if (valNum > maxCashLimit) {
        sanitized = String(maxCashLimit);
      }
    }

    setCashGiven(sanitized);
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'K';

  return (
    <div className="h-full flex flex-col space-y-3 overflow-hidden animate-fade-in text-gray-900">
      {/* Toast Notification */}
      {notification && (
        <div className="shrink-0 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button suppressHydrationWarning onClick={() => setNotification('')} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Top Bar - Tablet Touch Optimized */}
      <div className="shrink-0 bg-white rounded-2xl border border-gray-200 px-5 py-3 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 leading-tight">SIMAKO POS</h1>
            <p className="text-xs text-gray-400 font-medium">Tablet Cashier Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Order Type Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200 text-sm font-medium">
            {(['dine_in', 'takeaway'] as const).map(t => (
              <button suppressHydrationWarning key={t} onClick={() => setOrderType(t)}
                className={`px-4 py-2 rounded-lg transition-all capitalize text-sm ${orderType === t ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}>
                {t === 'dine_in' ? 'Dine-In' : 'Takeaway'}
              </button>
            ))}
          </div>

          {/* Table Selector Dropdown */}
          {orderType === 'dine_in' && (
            <select suppressHydrationWarning value={selectedTable} onChange={e => setSelectedTable(e.target.value)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="T01">Table 01 — Indoor</option>
              <option value="T02">Table 02</option>
              <option value="T03">Table 03 — Indoor</option>
              <option value="OUT01">Outdoor 01</option>
              <option value="VIP01">VIP Lounge 1</option>
            </select>
          )}

          {/* User Profile & Logout */}
          <div className="h-7 w-px bg-gray-200 hidden sm:block mx-1" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold flex items-center justify-center text-sm">
              {initial}
            </div>
            <span className="text-sm font-bold text-gray-800 hidden md:inline">{user?.name ?? 'Cashier'}</span>
            <button
              suppressHydrationWarning
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Logout Kasir"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Menu Catalog */}
        <div className="lg:col-span-2 flex flex-col min-h-0 space-y-3 overflow-hidden">
          {/* Category Tabs + Search Bar */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {categories.map(c => (
                <button suppressHydrationWarning key={c.id} onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border shrink-0 transition-all active:scale-95
                    ${activeCategory === c.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto sm:w-52 shrink-0 flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input suppressHydrationWarning type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          {/* Menu Catalog Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3.5 auto-rows-max">
            {filteredMenus.map(m => {
              const isAvailable = m.is_available !== false && (m.stock === undefined || m.stock > 0);

              return (
                <button
                  suppressHydrationWarning
                  key={m.id}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && addToCart(m)}
                  className={`rounded-2xl border overflow-hidden text-left group transition-all select-none flex flex-col relative ${
                    isAvailable
                      ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer active:scale-[0.97]'
                      : 'bg-gray-100/90 border-gray-300 opacity-60 grayscale cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <div className="relative h-32 bg-gray-200 overflow-hidden">
                    <img
                      src={m.image}
                      alt={m.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isAvailable ? 'group-hover:scale-105' : 'filter blur-[0.5px]'
                      }`}
                    />

                    {/* Non-Aktif / Habis Overlay Badge */}
                    {!isAvailable ? (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center p-2">
                        <span className="px-3 py-1.5 rounded-xl bg-red-600/90 text-white font-extrabold text-xs shadow-md border border-red-400/40 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                          Habis / Stok Kosong
                        </span>
                      </div>
                    ) : m.is_kitchen_item ? (
                      <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-xs font-semibold">
                        <ChefHat className="w-3 h-3" /> Kitchen
                      </span>
                    ) : null}
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className={`font-bold text-sm line-clamp-1 leading-snug ${isAvailable ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{m.code}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-base font-extrabold ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`}>
                        {formatRupiah(m.price)}
                      </p>
                      {!isAvailable && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          Non-Aktif
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Cart Panel (Gambar User) */}
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden shadow-sm">
          {/* Cart Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-base text-gray-900">Order Cart</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{cart.length}</span>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
              {orderType === 'dine_in' ? `Table ${selectedTable}` : 'Takeaway'}
            </span>
          </div>

          {/* Cart Items List - Tablet Large Size Touch Controls */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 min-h-0 max-h-[calc(100vh-360px)] lg:max-h-[calc(100vh-270px)]">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-gray-300 space-y-3">
                <Coffee className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-base text-gray-500 font-bold">Cart is empty</p>
                <p className="text-xs text-gray-400">Pilih menu di sebelah kiri untuk menambah item</p>
              </div>
            ) : cart.map(item => (
              <div key={item.id} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-bold text-sm text-gray-900 leading-snug flex-1">{item.name}</p>
                  <button suppressHydrationWarning onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Hapus item">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <input suppressHydrationWarning type="text" placeholder="Catatan khusus (misal: Less ice, extra pedas)..."
                  value={item.notes || ''} onChange={e => updateNotes(item.id, e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 text-gray-800 placeholder:text-gray-400" />

                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-blue-600">{formatRupiah(item.price * item.quantity)}</span>
                  
                  {/* Large Touch Target Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
                    <button suppressHydrationWarning onClick={() => updateQty(item.id, -1)} 
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center transition-all">
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                    <button suppressHydrationWarning onClick={() => updateQty(item.id, 1)} 
                      className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 flex items-center justify-center transition-all shadow-xs">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary & Action Buttons */}
          <div className="shrink-0 px-5 py-4 border-t border-gray-200 space-y-3.5 bg-white">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-gray-800">{formatRupiah(subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax (10%)</span><span className="font-semibold text-gray-800">{formatRupiah(tax)}</span></div>
              {orderType === 'dine_in' && <div className="flex justify-between"><span>Service (5%)</span><span className="font-semibold text-gray-800">{formatRupiah(service)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 text-gray-900">
                <span>Total Bayar</span>
                <span className="text-lg font-extrabold text-blue-600">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <div>
              <button suppressHydrationWarning onClick={() => { setCashGiven(String(grandTotal)); setShowPaymentModal(true); }} disabled={cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-md active:scale-[0.98]">
                <CreditCard className="w-4 h-4" /> Bayar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Proses Pembayaran
              </h3>
              <button suppressHydrationWarning onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="text-center p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Tagihan</p>
              <p className="text-3xl font-extrabold text-blue-600">{formatRupiah(grandTotal)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-2.5">
                {(['cash', 'qris', 'card'] as const).map(m => (
                  <button suppressHydrationWarning key={m} onClick={() => setPaymentMethod(m)}
                    className={`py-3 rounded-xl text-sm font-extrabold uppercase border transition-all active:scale-95
                      ${paymentMethod === m ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase">Uang Diterima (Rp)</label>
                    {maxCashLimit > 0 && (
                      <span className="text-[11px] font-semibold text-gray-400">
                        Maksimal: {formatRupiah(maxCashLimit)}
                      </span>
                    )}
                  </div>
                  <input suppressHydrationWarning type="text" inputMode="numeric" value={cashGiven} onChange={handleCashInputChange}
                    placeholder="0"
                    className="w-full px-4 py-3 text-lg font-extrabold rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {getPresetAmounts(grandTotal).map(amt => (
                    <button suppressHydrationWarning key={amt} onClick={() => setCashGiven(String(amt))}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        cashGiven === String(amt)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}>
                      {amt === grandTotal ? `${formatRupiah(amt)} (Uang Pas)` : formatRupiah(amt)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-sm font-bold text-emerald-800">Kembalian:</span>
                  <span className="font-extrabold text-lg text-emerald-600">{formatRupiah(changeAmount)}</span>
                </div>
              </div>
            )}

            <button suppressHydrationWarning
              disabled={paymentMethod === 'cash' && numericCash < grandTotal}
              onClick={() => { setShowPaymentModal(false); setShowReceiptModal(true); }}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base shadow-md transition-all active:scale-[0.98]">
              Konfirmasi & Cetak Struk
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" /> Pratinjau Struk
              </h3>
              <button suppressHydrationWarning onClick={() => setShowReceiptModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div id="thermal-struk" className="bg-white text-black p-4 rounded-xl font-mono text-xs space-y-3 border border-gray-200">
              <div className="text-center border-b border-dashed border-gray-300 pb-2">
                <p className="font-bold text-sm">SIMAKO POS & RESTO</p>
                <p className="text-[10px] text-gray-500">Jl. Boulevard Raya No. 88, Jakarta</p>
                <p className="text-[10px] text-gray-500">0812-3456-7890</p>
              </div>
              <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-300 pb-2 text-gray-600">
                <p>Order : ORD-{Date.now().toString().slice(-6)}</p>
                <p>Table : {selectedTable} ({orderType})</p>
                <p>Date  : {new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-1 border-b border-dashed border-gray-300 pb-2">
                {cart.map(item => (
                  <div key={item.id}>
                    <div className="flex justify-between text-[11px]">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                    {item.notes && <p className="text-[9px] text-gray-400 pl-2">* {item.notes}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-0.5 text-[11px] border-b border-dashed border-gray-300 pb-2">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax (10%)</span><span>{formatRupiah(tax)}</span></div>
                {orderType === 'dine_in' && <div className="flex justify-between"><span>Service (5%)</span><span>{formatRupiah(service)}</span></div>}
                <div className="flex justify-between font-bold pt-0.5"><span>TOTAL</span><span>{formatRupiah(grandTotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Cash</span><span>{formatRupiah(numericCash)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Change</span><span>{formatRupiah(changeAmount)}</span></div>
              </div>
              <div className="text-center text-[9px] text-gray-400">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>WiFi: simakopos2026</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button suppressHydrationWarning onClick={() => window.print()}
                className="flex-1 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors">
                <Printer className="w-4 h-4 text-gray-600" /> Cetak Struk
              </button>
              <button suppressHydrationWarning onClick={() => {
                sendToKitchen(true);
                setShowReceiptModal(false);
              }}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]">
                <Send className="w-4 h-4 text-white" /> Kirim ke Dapur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
