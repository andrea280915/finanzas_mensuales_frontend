import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Download, Plus, Trash2, Tag } from 'lucide-react';

export const CategoryManager = () => {
  const context = useFinance();

  // 1. Defensas sobre el contexto
  const rawCategories = context?.categories;
  const addCategory = context?.addCategory || (() => {});
  const deleteCategory = context?.deleteCategory || (() => {});
  const exportToExcel = context?.exportToExcel || (() => {});

  const [name, setName] = useState('');
  const [type, setType] = useState('gasto');
  const [groupType, setGroupType] = useState('necesidad');

  // 2. Normalizar categorías soportando Arrays de objetos, Strings u Objetos anidados
  const categoriesList = React.useMemo(() => {
    if (!rawCategories) return [];
    
    // Si viene como Array
    if (Array.isArray(rawCategories)) {
      return rawCategories.map((cat, idx) => {
        if (typeof cat === 'object' && cat !== null) {
          return {
            id: cat.id || cat._id || `cat-${idx}-${cat.name}`,
            name: cat.name || 'Sin nombre',
            type: cat.type || 'gasto',
            group_type: cat.group_type || cat.typeGroup || null,
          };
        }
        return {
          id: `cat-${idx}-${cat}`,
          name: String(cat),
          type: 'general',
          group_type: null,
        };
      });
    }

    // Si viene como objeto por tipos: { gasto: [...], ingreso: [...] }
    if (typeof rawCategories === 'object') {
      const flatList = [];
      Object.keys(rawCategories).forEach((key) => {
        const item = rawCategories[key];
        if (Array.isArray(item)) {
          item.forEach((c, idx) => {
            if (typeof c === 'object' && c !== null) {
              flatList.push({
                id: c.id || `${key}-${idx}`,
                name: c.name || String(c),
                type: key,
                group_type: c.type || null,
              });
            } else {
              flatList.push({
                id: `${key}-${idx}-${c}`,
                name: String(c),
                type: key,
                group_type: null,
              });
            }
          });
        }
      });
      return flatList;
    }

    return [];
  }, [rawCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    addCategory({
      name: cleanName,
      type,
      // Se envía group_type solo si es tipo 'gasto'
      group_type: type === 'gasto' ? groupType : null,
      color: type === 'gasto' ? '#f43f5e' : type === 'ingreso' ? '#10b981' : '#0d9488',
    });

    setName('');
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      {/* Cabecera */}
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center">
          <Tag className="w-5 h-5 text-indigo-600 mr-2" /> Categorías y Reportes
        </h3>
        <button
          onClick={exportToExcel}
          className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center transition-colors shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4 mr-1" /> Exportar a Excel
        </button>
      </div>

      {/* Formulario adaptable con Flexbox para evitar huecos en el Grid */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <input
          type="text"
          placeholder="Nombre categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border border-slate-300 rounded-lg text-xs flex-1 min-w-[140px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
        >
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
          <option value="ahorro">Ahorro</option>
        </select>

        {type === 'gasto' && (
          <select
            value={groupType}
            onChange={(e) => setGroupType(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="necesidad">Necesidad (50%)</option>
            <option value="deseo">Deseo (30%)</option>
          </select>
        )}

        <button
          type="submit"
          className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1" /> Agregar
        </button>
      </form>

      {/* Lista de Chips de Categorías */}
      <div className="flex flex-wrap gap-2 pt-2">
        {categoriesList.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No hay categorías registradas.</p>
        ) : (
          categoriesList.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-xs"
            >
              <span className="font-semibold text-slate-900">{cat.name}</span>
              <span className="ml-1 text-[10px] text-slate-500 capitalize">({cat.type})</span>
              {cat.group_type && (
                <span className="ml-1 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                  {cat.group_type}
                </span>
              )}
              <button
                onClick={() => deleteCategory(cat.id)}
                className="ml-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Eliminar categoría"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};
