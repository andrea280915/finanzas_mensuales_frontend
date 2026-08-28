import React, { useState, useMemo } from 'react';
import { useFinance, CATEGORIES } from '../context/FinanceContext';
import { Target, Sliders, Plus, Trash2 } from 'lucide-react';

export const SavingsModule = () => {
  const { savingGoals, filteredTransactions, totalIncome, totalSavedInMonth, updateGoalProgress, deleteGoal, addGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!name || !target) return;
    addGoal({ name, target: Number(target), current: 0 });
    setName('');
    setTarget('');
    setShowForm(false);
  };

  const rule503020 = useMemo(() => {
    const needs = filteredTransactions
      .filter((t) => t.type === 'gasto' && CATEGORIES.gasto.find((c) => c.name === t.category)?.type === 'necesidad')
      .reduce((a, b) => a + b.amount, 0);

    const wants = filteredTransactions
      .filter((t) => t.type === 'gasto' && CATEGORIES.gasto.find((c) => c.name === t.category)?.type === 'deseo')
      .reduce((a, b) => a + b.amount, 0);

    return {
      needs,
      wants,
      savings: totalSavedInMonth,
      targetNeeds: totalIncome * 0.5,
      targetWants: totalIncome * 0.3,
      targetSavings: totalIncome * 0.2,
    };
  }, [filteredTransactions, totalIncome, totalSavedInMonth]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center">
            <Target className="w-5 h-5 text-emerald-600 mr-2" /> Metas de Ahorro
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 font-semibold flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Nueva Meta
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateGoal} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Nombre de la meta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border rounded-lg text-xs flex-1"
              required
            />
            <input
              type="number"
              placeholder="Objetivo (S/)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="p-2 border rounded-lg text-xs w-28"
              required
            />
            <button type="submit" className="bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg font-bold">
              Guardar
            </button>
          </form>
        )}

        <div className="space-y-4">
          {savingGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">{goal.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const val = prompt('Nuevo monto ahorrado:', goal.current);
                        if (val !== null) updateGoalProgress(goal.id, Number(val));
                      }}
                      className="text-xs text-sky-600 font-medium hover:underline"
                    >
                      Ajustar
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Progreso: {pct}%</span>
                  <span>S/ {goal.current} / S/ {goal.target}</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className={`h-full ${goal.color || 'bg-emerald-500'} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center border-b pb-3">
          <Sliders className="w-5 h-5 text-indigo-600 mr-2" /> Regla 50 / 30 / 20
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1 font-semibold">
              <span>50% Necesidades</span>
              <span>S/ {rule503020.needs.toFixed(0)} / S/ {rule503020.targetNeeds.toFixed(0)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, rule503020.targetNeeds > 0 ? (rule503020.needs / rule503020.targetNeeds) * 100 : 0)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1 font-semibold">
              <span>30% Deseos</span>
              <span>S/ {rule503020.wants.toFixed(0)} / S/ {rule503020.targetWants.toFixed(0)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, rule503020.targetWants > 0 ? (rule503020.wants / rule503020.targetWants) * 100 : 0)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1 font-semibold">
              <span>20% Ahorro</span>
              <span>S/ {rule503020.savings.toFixed(0)} / S/ {rule503020.targetSavings.toFixed(0)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, rule503020.targetSavings > 0 ? (rule503020.savings / rule503020.targetSavings) * 100 : 0)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};