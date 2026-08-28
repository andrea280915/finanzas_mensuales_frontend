import React from 'react';
import { useFinance, MONTHS } from '../context/FinanceContext';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export const MonthFilter = () => {
  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useFinance();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <CalendarCheck className="w-5 h-5 text-sky-600" />
        <h2 className="text-base font-semibold text-slate-800">Periodo de Consulta:</h2>
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto justify-center">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Ant.
        </button>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg focus:ring-sky-500 focus:border-sky-500 p-2 cursor-pointer"
        >
          {MONTHS.map((m, idx) => (
            <option key={m} value={idx}>{m}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg focus:ring-sky-500 focus:border-sky-500 p-2 cursor-pointer"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button
          onClick={handleNextMonth}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm flex items-center"
        >
          Sig. <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
        Mostrando: <strong className="text-slate-700">{MONTHS[selectedMonth]} {selectedYear}</strong>
      </div>
    </div>
  );
};