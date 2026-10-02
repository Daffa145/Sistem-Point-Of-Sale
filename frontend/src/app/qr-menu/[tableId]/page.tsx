'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/api';
import { Coffee, Plus, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function QrDigitalMenuPage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = React.use(params);
  const tableCode = resolvedParams?.tableId || 'T01';

  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);
  const [orderSent, setOrderSent] = useState(false);

  const initialMenus = [
    { id: 1, category: 'coffee', name: 'Espresso Single', price: 20000, is_available: true, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80' },
    { id: 2, category: 'coffee', name: 'Caffè Latte', price: 32000, is_available: true, image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80' },
    { id: 3, category: 'non-coffee', name: 'Matcha Latte Ice', price: 34000, is_available: true, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80' },
    { id: 4, category: 'food', name: 'Nasi Goreng Special', price: 45000, is_available: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80' },
    { id: 5, category: 'snack', name: 'Truffle Parmesan Fries', price: 28000, is_available: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80' },
  ];

  const [menus, setMenus] = useState<any[]>(initialMenus);

  const loadMenus = () => {
    try {
      const saved = localStorage.getItem('simako_menus');
      if (saved) {
        setMenus(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadMenus();
    window.addEventListener('storage', loadMenus);
    return () => window.removeEventListener('storage', loadMenus);
  }, []);

  const categories = ['all', 'coffee', 'non-coffee', 'food', 'snack', 'snacks', 'dessert'];

  const filteredMenus = menus.filter(m => activeCategory === 'all' || m.category === activeCategory);

  const addToCart = (m: any) => {
    if (m.is_available === false) return;
    const existing = cart.find(c => c.id === m.id);
    if (existing) {
      setCart(cart.map(c => c.id === m.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { id: m.id, name: m.name, price: m.price, qty: 1 }]);
    }
  };

  const total = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);

  const sendOrderToKitchen = () => {
    if (cart.length === 0) return;

    let currentOrders = [];
    try {
      const saved = localStorage.getItem('simako_orders');
      if (saved) {
        currentOrders = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    const newOrder = {
      id: Date.now(),
      order_number: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      table: 'Table ' + tableCode,
      time_elapsed: '1 min',
      status: 'queued',
      notes: 'Self-Order dari Meja ' + tableCode,
      items: cart.map(c => ({
        name: c.name,
        qty: c.qty,
        notes: null
      }))
    };

    const updatedOrders = [newOrder, ...currentOrders];
    localStorage.setItem('simako_orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));

    setCart([]);
    setOrderSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-gray-900">SIMAKO RESTO</h1>
            <p className="text-[11px] text-blue-600 font-medium">Meja: {tableCode}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
          Digital QR Menu
        </span>
      </div>

      {/* Hero Welcome */}
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
            <Sparkles className="w-4 h-4" /> Selamat datang!
          </div>
          <p className="text-xs text-gray-600">Pilih menu favorit Anda, pesanan akan langsung terkirim ke Dapur & Barista.</p>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              suppressHydrationWarning
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 border transition-all ${
                activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-3">
          {filteredMenus.map((m) => {
            const isAvailable = m.is_available !== false;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all shadow-sm ${
                  isAvailable ? 'bg-white border-gray-200 hover:border-blue-200' : 'bg-gray-100 border-gray-300 opacity-60 grayscale'
                }`}
              >
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white uppercase bg-red-600 px-1 py-0.5 rounded">Habis</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-xs ${isAvailable ? 'text-gray-800' : 'text-gray-500 line-through'}`}>{m.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`font-bold text-xs ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`}>{formatRupiah(m.price)}</p>
                    {!isAvailable && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Habis</span>}
                  </div>
                </div>
                <button
                  suppressHydrationWarning
                  disabled={!isAvailable}
                  onClick={() => addToCart(m)}
                  className={`p-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors ${
                    isAvailable ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !orderSent && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-between max-w-lg mx-auto shadow-lg">
          <div>
            <p className="text-[10px] text-gray-500 font-medium">{cart.reduce((a, b) => a + b.qty, 0)} Item dipilih</p>
            <h3 className="font-bold text-base text-blue-600">{formatRupiah(total)}</h3>
          </div>
          <button
            suppressHydrationWarning
            onClick={sendOrderToKitchen}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" /> Kirim Pesanan Meja
          </button>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderSent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 max-w-xs w-full space-y-4 shadow-xl animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Pesanan Diterima!</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pesanan Anda telah dikirim ke Dapur Resto untuk Meja <span className="font-bold text-blue-600">{tableCode}</span>.
            </p>
            <button
              suppressHydrationWarning
              onClick={() => setOrderSent(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Pesan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
