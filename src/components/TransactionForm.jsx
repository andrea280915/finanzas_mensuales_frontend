import React, { useState } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { PlusCircle } from 'lucide-react';

export const TransactionForm = () => {
  const { categories: customCategories, addTransaction } = useFinance();
  const [type, setType] = useState('gasto');
  const [amount, setAmount] = useState('');
  
  // Normalizar las categorías disponibles (strings)
  const availableCategories = Array.isArray(customCategories) && customCategories.length > 0
    ? customCategories.map(c => typeof c === 'string' ? c : c.name)
    : CATEGORIES;

  const [category, setCategory] = useState(availableCategories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    if (availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numVal = parseFloat(amount);
    if (!numVal || numVal <= 0) return;

    addTransaction({
      id: Date.now(),
      type,
      amount: numVal,
      category,
      date,
      note: note.trim() || category,
    });

    setAmount('');
    setNote('');
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
        <PlusCircle className="w-5 h-5 text-sky-600 mr-2" />
        Registrar Movimiento
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('gasto')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'gasto' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('ingreso')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('ahorro')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'ahorro' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ahorro
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Monto (S/)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-bold">S/</span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            {availableCategories.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nota o Detalle</label>
          <input
            type="text"
            placeholder="Ej. Mercado quincenal"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-[0.98]"
        >
          Guardar Transacción
        </button>
      </form>
    </div>
  );
};