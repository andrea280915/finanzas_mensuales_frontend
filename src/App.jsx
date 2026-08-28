import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthModal } from './components/AuthModal'; // Ajusta o usa Login según tu estructura
import { Header } from './components/Header';
import { CategoryManager } from './components/CategoryManager';
import { MonthFilter } from './components/MonthFilter';
import { MetricsSummary } from './components/MetricsSummary';
import { Charts } from './components/Charts';
import { SavingsModule } from './components/SavingsModule';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';

function MainContent() {
  const { token, loading } = useFinance();

  // 1. Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Cargando sesión...
      </div>
    );
  }

  // 2. Si no hay token guardado, muestra la pantalla de inicio de sesión / registro
  if (!token) {
    return <AuthModal />; 
  }

  // 3. Renderizado del Dashboard principal
  return (
    <div className="min-h-screen pb-12 bg-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <MonthFilter />
        <CategoryManager />
        <MetricsSummary />
        <Charts />
        <SavingsModule />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TransactionForm />
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}