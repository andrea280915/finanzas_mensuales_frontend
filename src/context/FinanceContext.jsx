import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const FinanceContext = createContext();
// Reemplaza la URL fija de localhost por la variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CATEGORIES = [
  'Comida & Súper',
  'Servicios Básicos',
  'Vivienda & Renta',
  'Transporte',
  'Entretenimiento',
  'Sueldo Principal',
  'Aporte a Ahorro'
];

export const FinanceProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper para headers autenticados
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Autenticación
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en inicio de sesión');
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrarse');
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setSavingGoals([]);
    setCategories([]);
  };

  // Carga inicial de datos y verificación de usuario tras autenticar
useEffect(() => {
  if (!token) {
    setLoading(false);
    return;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Obtener datos del usuario logueado + datos de la app
      const [userRes, txRes, goalsRes, catRes] = await Promise.all([
        fetch(`${API_URL}/auth/me`, { headers: authHeaders() }),
        fetch(`${API_URL}/transactions`, { headers: authHeaders() }),
        fetch(`${API_URL}/goals`, { headers: authHeaders() }),
        fetch(`${API_URL}/categories`, { headers: authHeaders() })
      ]);

      if (userRes.status === 401 || txRes.status === 401 || goalsRes.status === 401 || catRes.status === 401) {
        logout();
        return;
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : (txData.data || []));
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setSavingGoals(Array.isArray(goalsData) ? goalsData : []);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [token]);

  // Transacciones
  const addTransaction = async (newTx) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(newTx)
    });
    if (res.ok) {
      const created = await res.json();
      setTransactions((prev) => [created, ...prev]);
    }
  };

  const deleteTransaction = async (id) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Metas de Ahorro
  const addGoal = async (newGoal) => {
    const res = await fetch(`${API_URL}/goals`, { 
      method: 'POST', 
      headers: authHeaders(), 
      body: JSON.stringify(newGoal) 
    });
    if (res.ok) {
      const createdGoal = await res.json();
      setSavingGoals((prev) => [...prev, createdGoal]);
    }
  };

  const updateGoalProgress = async (id, current) => {
    const res = await fetch(`${API_URL}/goals/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ current }) });
    if (res.ok) {
      const updated = await res.json();
      setSavingGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  };

  const deleteGoal = async (id) => {
    const res = await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) setSavingGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Categorías
  const addCategory = async (cat) => {
    const res = await fetch(`${API_URL}/categories`, { 
      method: 'POST', 
      headers: authHeaders(), 
      body: JSON.stringify(cat) 
    });
    if (res.ok) {
      const createdCategory = await res.json();
      setCategories((prev) => [...prev, createdCategory]);
    }
  }; 

  const deleteCategory = async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Exportar Excel
  const exportToExcel = async () => {
    const res = await fetch(`${API_URL}/export/excel?month=${selectedMonth}&year=${selectedYear}`, {
      headers: authHeaders()
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${selectedYear}_${selectedMonth + 1}.xlsx`;
    a.click();
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date + 'T00:00:00');
      return d.getUTCMonth() === selectedMonth && d.getUTCFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = useMemo(() => filteredTransactions.filter((t) => t.type === 'ingreso').reduce((a, b) => a + b.amount, 0), [filteredTransactions]);
  const totalExpense = useMemo(() => filteredTransactions.filter((t) => t.type === 'gasto').reduce((a, b) => a + b.amount, 0), [filteredTransactions]);
  const totalSavedInMonth = useMemo(() => filteredTransactions.filter((t) => t.type === 'ahorro').reduce((a, b) => a + b.amount, 0), [filteredTransactions]);
  const netBalance = totalIncome - totalExpense - totalSavedInMonth;

  return (
    <FinanceContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        transactions,
        filteredTransactions,
        savingGoals,
        categories,
        addTransaction,
        deleteTransaction,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        addCategory,
        deleteCategory,
        exportToExcel,
        totalIncome,
        totalExpense,
        totalSavedInMonth,
        netBalance,
        loading
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);