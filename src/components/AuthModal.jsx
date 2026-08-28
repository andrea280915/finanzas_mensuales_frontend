import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, LogIn, UserPlus, Lock, Mail, User } from 'lucide-react';

export const AuthModal = () => {
  const { login, register } = useFinance();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          throw new Error('El nombre es obligatorio');
        }
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Encabezado con Icono */}
        <div className="bg-slate-900 p-6 text-center text-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Gestor de Finanzas</h2>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? 'Inicia sesión para acceder a tu panel' : 'Crea una cuenta para comenzar'}
          </p>
        </div>

        {/* Pestañas de Alternancia */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              isLogin
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              !isLogin
                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-lg border border-rose-200 font-medium">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <span>Cargando...</span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Crear Cuenta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};