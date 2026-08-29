import React, { useState, useMemo } from 'react';
import { useFinance, MONTHS } from '../context/FinanceContext';
import { ListChecks, Search, Trash2, FolderOpen } from 'lucide-react';

export const TransactionList = () => {
  const { filteredTransactions, selectedMonth, selectedYear, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = useMemo(() => {
    if (!searchTerm) return filteredTransactions;
    return filteredTransactions.filter(
      (t) =>
        (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [filteredTransactions, searchTerm]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center">
            <ListChecks className="w-5 h-5 text-slate-600 mr-2" />
            Movimientos de {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          <p className="text-xs text-slate-500">{filteredList.length} registros encontrados</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por detalle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredList.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="py-2.5 px-2">Tipo</th>
                <th className="py-2.5 px-2">Detalle / Categoría</th>
                <th className="py-2.5 px-2">Fecha</th>
                <th className="py-2.5 px-2 text-right">Monto</th>
                <th className="py-2.5 px-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredList.map((tx) => {
                const isExpense = tx.type === 'gasto';
                const isIncome = tx.type === 'ingreso';
                const amountNum = Number(tx.amount) || 0;
                const formattedDate = tx.date ? tx.date.split('T')[0] : '';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isIncome ? 'bg-emerald-100 text-emerald-800' :
                        isExpense ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {(tx.type || '').toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-2">
                      <div>
                        <p className="font-bold text-slate-800">{tx.note || tx.category}</p>
                        <p className="text-[10px] text-slate-400">{tx.category}</p>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className={`py-3 px-2 text-right font-extrabold whitespace-nowrap ${
                      isIncome ? 'text-emerald-600' : isExpense ? 'text-rose-600' : 'text-teal-600'
                    }`}>
                      {isExpense ? '-' : '+'}&nbsp;S/ {amountNum.toFixed(2)}
                    </td>

                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors rounded-lg hover:bg-rose-50"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
            <FolderOpen className="w-8 h-8 mb-2 text-slate-300" />
            No se encontraron transacciones para este periodo.
          </div>
        )}
      </div>
    </div>
  );
};
