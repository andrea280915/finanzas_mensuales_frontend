import React, { useMemo } from 'react';
import { useFinance, MONTHS } from '../context/FinanceContext';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Paleta de colores para el gráfico de pastel por categoría
const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
];

export const Charts = () => {
  // 1. Extraer variables del Context con valores por defecto defensivos
  const { filteredTransactions = [], transactions = [], selectedMonth, selectedYear } = useFinance();

  const expensePieData = useMemo(() => {
    const catMap = {};
    
    (Array.isArray(filteredTransactions) ? filteredTransactions : [])
      .filter((t) => t && t.type === 'gasto')
      .forEach((t) => { 
        // Normalizar nombre de categoría (sea string u objeto)
        const catName = typeof t.category === 'object' && t.category !== null 
          ? (t.category.name || 'Sin categoría')
          : (t.category || 'Sin categoría');

        const amount = Number(t.amount) || 0;
        catMap[catName] = (catMap[catName] || 0) + amount; 
      });

    return Object.keys(catMap).map((catName, index) => ({
      name: catName, 
      value: catMap[catName], 
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] 
    }));
  }, [filteredTransactions]);

  const historicalData = useMemo(() => {
    const list = [];
    const safeTxList = Array.isArray(transactions) ? transactions : [];

    for (let i = 5; i >= 0; i--) {
      // Cálculo manual del mes y año restando i meses
      let targetMonth = selectedMonth - i;
      let targetYear = selectedYear;

      while (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      const monthTxs = safeTxList.filter((t) => {
        if (!t || !t.date) return false;
        // Parsing por String para evitar desajuste UTC/Local
        const dateStr = String(t.date).split('T')[0];
        const [yStr, mStr] = dateStr.split('-');
        
        const txYear = parseInt(yStr, 10);
        const txMonth = parseInt(mStr, 10) - 1;

        return txMonth === targetMonth && txYear === targetYear;
      });

      list.push({
        name: `${MONTHS[targetMonth] ? MONTHS[targetMonth].substring(0, 3) : ''} ${targetYear}`,
        Ingresos: monthTxs.filter((t) => t.type === 'ingreso').reduce((a, b) => a + (Number(b.amount) || 0), 0),
        Gastos: monthTxs.filter((t) => t.type === 'gasto').reduce((a, b) => a + (Number(b.amount) || 0), 0),
        Ahorro: monthTxs.filter((t) => t.type === 'ahorro').reduce((a, b) => a + (Number(b.amount) || 0), 0),
      });
    }
    return list;
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 flex items-center mb-4">
          <PieIcon className="w-5 h-5 text-sky-500 mr-2" /> Gastos por Categoría
        </h3>
        {expensePieData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`S/ ${Number(val).toFixed(2)}`, 'Monto']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Sin gastos este mes</div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-500 mr-2" /> Histórico (Últimos 6 Meses)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`S/ ${Number(val).toFixed(2)}`]} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ahorro" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
