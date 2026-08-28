import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, ShieldCheck, LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useFinance();

  // Obtener iniciales dinámicas del nombre del usuario
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-500 text-white p-2 rounded-xl shadow-md">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-100">
            MiControl <span className="text-sky-400 font-light text-sm">Finanzas & Ahorro</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="hidden sm:inline-flex items-center text-xs bg-slate-800 text-sky-300 px-3 py-1 rounded-full border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Ahorro Activo
          </span>

          {/* Avatar del usuario con sus iniciales */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {initials}
            </div>
            <span className="hidden md:inline-block text-sm font-medium text-slate-200">
              {user?.name || 'Usuario'}
            </span>
          </div>

          {/* Botón de cerrar sesión */}
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600/80 rounded-lg transition-colors border border-slate-700 hover:border-rose-500"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};