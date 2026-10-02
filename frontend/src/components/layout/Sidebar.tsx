'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Coffee,
  Grid2X2,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  CalendarDays,
  QrCode,
  Sparkles,
  LogOut,
  UserCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Array<'admin' | 'manager' | 'cashier' | 'kitchen' | 'waiter'>;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard',       href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
      { label: 'POS Cashier',     href: '/pos',       icon: UtensilsCrossed, roles: ['admin', 'manager', 'cashier'] },
      { label: 'Kitchen Display', href: '/kitchen',   icon: ChefHat,         roles: ['admin', 'manager', 'kitchen'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Master Menu',     href: '/menu',      icon: Coffee,       roles: ['admin', 'manager'] },
      { label: 'Table Management',href: '/tables',    icon: Grid2X2,      roles: ['admin', 'manager'] },
      { label: 'Customers',       href: '/customers', icon: Users,        roles: ['admin', 'manager'] },
      { label: 'Suppliers',       href: '/suppliers', icon: Building2,    roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Inventory & Purchase',
    items: [
      { label: 'Inventory',       href: '/inventory', icon: Package,      roles: ['admin', 'manager'] },
      { label: 'Purchase Orders', href: '/purchase',  icon: ShoppingCart, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Finance & Reports',
    items: [
      { label: 'Payments',        href: '/payments',  icon: Receipt,      roles: ['admin', 'manager'] },
      { label: 'Reports',         href: '/reports',   icon: BarChart3,    roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Customer Experience',
    items: [
      { label: 'Reservations',    href: '/reservations',   icon: CalendarDays, roles: ['admin', 'manager'] },
      { label: 'QR Digital Menu', href: '/qr-menu/T01',    icon: QrCode,       roles: ['admin', 'manager'] },
      { label: 'Analytics AI',    href: '/analytics',      icon: Sparkles,     roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'User Management', href: '/users', icon: UserCircle, roles: ['admin', 'manager'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userRole = user?.role ?? 'cashier';

  const filteredMenuGroups = menuGroups
    .map((group) => {
      const items = group.items.filter(
        (item) => !item.roles || item.roles.includes(userRole)
      );
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  const initial = (user?.name?.charAt(0)?.toUpperCase()) ?? 'U';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-60 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 h-14 px-5 border-b border-gray-200 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Coffee className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-[13px] text-gray-900 leading-tight">SIMAKO</p>
            <p className="text-[10px] text-gray-400 font-medium">Restaurant & Coffee</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {filteredMenuGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                        ${isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                {initial}
              </div>
              <div className="truncate min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                  {user?.name ?? 'Staff'}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {user?.role ?? 'Cashier'}
                </p>
              </div>
            </div>
            <button
              suppressHydrationWarning
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
