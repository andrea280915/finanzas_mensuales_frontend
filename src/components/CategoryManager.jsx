import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Download, Plus, Trash2, Tag } from 'lucide-react';

export const CategoryManager = () => {
  const { categories, addCategory, deleteCategory, exportToExcel } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState('gasto');
  const [groupType, setGroupType] = useState('necesidad');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    addCategory({ name, type, group_type: groupType, color: '#3b82f6' });
    setName('');
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center">
          <Tag className="w-5 h-5 text-indigo-600 mr-2" /> Categorías y Reportes
        </h3>
        <button
          onClick={exportToExcel}
          className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-1" /> Exportar a Excel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <input
          type="text"
          placeholder="Nombre categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded-lg text-xs"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded-lg text-xs bg-white">
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
          <option value="ahorro">Ahorro</option>
        </select>
        {type === 'gasto' && (
          <select value={groupType} onChange={(e) => setGroupType(e.target.value)} className="p-2 border rounded-lg text-xs bg-white">
            <option value="necesidad">Necesidad (50%)</option>
            <option value="deseo">Deseo (30%)</option>
          </select>
        )}
        <button type="submit" className="bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center">
          <Plus className="w-4 h-4 mr-1" /> Agregar
        </button>
      </form>

      <div className="flex flex-wrap gap-2 pt-2">
        {categories.map((cat) => (
          <span key={cat.id} className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
            {cat.name} ({cat.type})
            <button onClick={() => deleteCategory(cat.id)} className="ml-1.5 text-slate-400 hover:text-rose-600">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};