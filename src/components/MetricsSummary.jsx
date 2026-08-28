import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, PiggyBank, Scale } from 'lucide-react';

export const MetricsSummary = () => {
  const { totalIncome, totalExpense, totalSavedInMonth, netBalance } = useFinance();
  const savingsRate = totalIncome > 0 ? ((totalSavedInMonth / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Ingresos Totales</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              S/ {totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Total recaudado en el mes</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Gastos Totales</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              S/ {totalExpense.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(0)}% del ingreso gastado` : 'Sin ingresos'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Ahorrado en el Mes</p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">
              S/ {totalSavedInMonth.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-teal-700 mt-3 font-medium">Tasa de Ahorro: {savingsRate}%</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Balance Disponible</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${netBalance >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
              S/ {netBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${netBalance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
            <Scale className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {netBalance >= 0 ? 'Remanente operativo libre' : 'Gastos superan ingresos'}
        </p>
      </div>
    </div>
  );
};