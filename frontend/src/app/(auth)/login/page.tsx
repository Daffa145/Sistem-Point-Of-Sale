'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Utensils } from 'lucide-react';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@pos.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Email or password is incorrect. Please try again.');
    }
    setLoading(false);
  };

  const quickRoles = [
    { email: 'admin@pos.com',   label: 'Admin',   icon: ShieldCheck },
    { email: 'cashier@pos.com', label: 'Cashier', icon: UserCheck },
    { email: 'kitchen@pos.com', label: 'Kitchen', icon: Utensils },
  ];

  return (
    <div className="relative min-h-screen h-screen max-h-screen w-full bg-stone-950 flex items-center justify-center sm:justify-start p-3 sm:p-6 md:p-8 md:pl-16 lg:pl-28 xl:pl-36 overflow-x-hidden overflow-y-auto no-scrollbar">
      {/* Concept F&B Atmosphere Background Image */}
      <img
        src="/login_bg.png"
        alt="SIMAKO F&B Atmosphere"
        className="absolute inset-0 w-full h-full object-cover opacity-100 scale-105 pointer-events-none filter brightness-100 contrast-100"
      />
/
      {/* Dark & Gold luxury ambient gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-900/80 pointer-events-none" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[340px] xs:max-w-[380px] sm:max-w-md my-auto">
        {/* Brand */}

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/80 p-4 xs:p-5 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4 max-h-[94vh] overflow-y-auto no-scrollbar">
          {/* Quick Role Selector */}
          <div>
            <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
              <img
                src="/logo.png"
                alt="SIMAKO Logo"
                className="h-20 xs:h-24 sm:h-32 md:h-36 w-auto object-contain max-h-[22vh]"
              />
              {/* Tagline below logo */}
              <div className="flex items-center justify-center w-full mt-2 sm:mt-3">
                <div className="h-[1px] w-6 sm:w-10 md:w-12 bg-amber-600/60" />
                <span className="px-1.5 sm:px-2.5 text-[9px] xs:text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.22em] text-amber-800 uppercase whitespace-nowrap">
                  FNB ERP SOLUTION
                </span>
                <div className="h-[1px] w-6 sm:w-10 md:w-12 bg-amber-600/60" />
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[8px] xs:text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-stone-600 uppercase mt-1">
                <span>MANAGE</span>
                <span className="text-amber-600 text-[7px] sm:text-[8px]">•</span>
                <span>OPERATE</span>
                <span className="text-amber-600 text-[7px] sm:text-[8px]">•</span>
                <span>GROW</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Login As</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {quickRoles.map((role) => {
                const Icon = role.icon;
                const isActive = email === role.email;
                return (
                  <button
                    suppressHydrationWarning
                    key={role.email}
                    type="button"
                    onClick={() => { setEmail(role.email); setPassword('password'); }}
                    className={`py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-lg border text-[11px] sm:text-xs font-medium flex flex-col items-center gap-1 sm:gap-1.5 transition-all
                      ${isActive
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-500/30'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  suppressHydrationWarning
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder="email@pos.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-500 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  suppressHydrationWarning
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-stone-950 via-amber-900 to-amber-600 hover:from-black hover:via-amber-800 hover:to-amber-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md active:scale-[0.99] mt-1"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p suppressHydrationWarning className="text-center text-[10px] sm:text-[11px] text-stone-400/90 mt-3 sm:mt-4">
          &copy; {new Date().getFullYear()} SIMAKO FNB ERP Solution. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
