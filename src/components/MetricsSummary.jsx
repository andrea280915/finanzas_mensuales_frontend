import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, PiggyBank, Scale } from 'lucide-react';

export const MetricsSummary = () => {
  const context = useFinance();

  // 1. Coerción segura a Number de todos los valores del contexto
  const income = Number(context?.totalIncome) || 0;
  const expense = Number(context?.totalExpense) || 0;
  const saved = Number(context?.totalSavedInMonth) || 0;
  const balance = Number(context?.netBalance) || 0;

  // 2. Cálculos protegidos contra división por cero
  const savingsRate = income > 0 ? ((saved / income) * 100).toFixed(1) : '0';
  const expensePercentage = income > 0 ? ((expense / income) * 100).toFixed(0) : '0';

  // Helper de formateo de moneda seguro
  const formatCurrency = (val) => {
    return val.toLocaleString('es-PE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ingresos Totales */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Ingresos Totales</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              S/ {formatCurrency(income)}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Total recaudado en el mes</p>
      </div>

      {/* Gastos Totales */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Gastos Totales</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              S/ {formatCurrency(expense)}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {income > 0 ? `${expensePercentage}% del ingreso gastado` : 'Sin ingresos registrados'}
        </p>
      </div>

      {/* Ahorrado en el Mes */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Ahorrado en el Mes</p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">
              S/ {formatCurrency(saved)}
            </h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-teal-700 mt-3 font-medium">Tasa de Ahorro: {savingsRate}%</p>
      </div>

      {/* Balance Disponible */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Balance Disponible</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${balance >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
              S/ {formatCurrency(balance)}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
            <Scale className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {balance >= 0 ? 'Remanente operativo libre' : 'Gastos superan ingresos'}
        </p>
      </div>
    </div>
  );
};
