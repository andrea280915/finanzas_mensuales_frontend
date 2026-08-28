import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useFinance();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2 text-slate-700 font-medium">
        <User className="w-5 h-5 text-sky-500" />
        <span>{user ? `Hola, ${user.name}` : 'Mi Panel'}</span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
    </nav>
  );
};