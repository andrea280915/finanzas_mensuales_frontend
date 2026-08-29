import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const FinanceContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Estructura dual compatible: funciona como Objeto clasificado y expone un getter a lista plana
export const CATEGORIES = {
  gasto: [
    { name: 'Comida & Súper', type: 'necesidad' },
    { name: 'Servicios Básicos', type: 'necesidad' },
    { name: 'Vivienda & Renta', type: 'necesidad' },
    { name: 'Transporte', type: 'necesidad' },
    { name: 'Entretenimiento', type: 'deseo' }
  ],
  ingreso: [
    { name: 'Sueldo Principal' },
    { name: 'Ventas / Freelance' }
  ],
  ahorro: [
    { name: 'Aporte a Ahorro' }
  ],
  // Array plano por omisión para compatibilidad con selectores simples
  all: [
    'Comida & Súper',
    'Servicios Básicos',
    'Vivienda & Renta',
    'Transporte',
    'Entretenimiento',
    'Sueldo Principal',
    'Aporte a Ahorro'
  ]
};

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

  // Normalizador de objetos para asegurar siempre una propiedad .id
  const normalizeItem = (item) => {
    if (!item || typeof item !== 'object') return item;
    return {
      ...item,
      id: item.id || item._id || item.name
    };
  };

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

  // Carga inicial de datos protegida contra Race Conditions
  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [userRes, txRes, goalsRes, catRes] = await Promise.all([
          fetch(`${API_URL}/auth/me`, { headers: authHeaders() }),
          fetch(`${API_URL}/transactions`, { headers: authHeaders() }),
          fetch(`${API_URL}/goals`, { headers: authHeaders() }),
          fetch(`${API_URL}/categories`, { headers: authHeaders() })
        ]);

        if (userRes.status === 401 || txRes.status === 401 || goalsRes.status === 401 || catRes.status === 401) {
          if (isMounted) logout();
          return;
        }

        if (!isMounted) return;

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user || userData);
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          const rawList = Array.isArray(txData) ? txData : (txData.data || []);
          setTransactions(rawList.map(normalizeItem));
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          const rawGoals = Array.isArray(goalsData) ? goalsData : (goalsData.data || []);
          setSavingGoals(rawGoals.map(normalizeItem));
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          const rawCats = Array.isArray(catData) ? catData : (catData.data || []);
          const normalizedCats = rawCats.map(normalizeItem);
          // Si la API devuelve vacíos, fall back a CATEGORIES por defecto
          setCategories(normalizedCats.length > 0 ? normalizedCats : CATEGORIES.all);
        } else {
          setCategories(CATEGORIES.all);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Transacciones
  const addTransaction = async (newTx) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(newTx)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.errors?.[0]?.msg || 'Error al guardar la transacción');
    }

    const savedTx = normalizeItem(data.transaction || data.data || data);
    const formattedTx = { ...savedTx, amount: Number(savedTx.amount) || 0 };
    
    setTransactions((prev) => [formattedTx, ...(Array.isArray(prev) ? prev : [])]);
    return formattedTx;
  };

  const deleteTransaction = async (id) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al eliminar la transacción');
    }
    setTransactions((prev) => prev.filter((t) => (t.id || t._id) !== id));
  };

  // Metas de Ahorro
  const addGoal = async (newGoal) => {
    const res = await fetch(`${API_URL}/goals`, { 
      method: 'POST', 
      headers: authHeaders(), 
      body: JSON.stringify(newGoal) 
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al agregar meta');
    const newGoalObj = normalizeItem(data.goal || data.data || data);
    setSavingGoals((prev) => [...(Array.isArray(prev) ? prev : []), newGoalObj]);
    return newGoalObj;
  };

  const updateGoalProgress = async (id, current) => {
    const res = await fetch(`${API_URL}/goals/${id}`, { 
      method: 'PUT', 
      headers: authHeaders(), 
      body: JSON.stringify({ current: Number(current) || 0 }) 
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar meta');
    const updatedGoal = normalizeItem(data.goal || data.data || data);
    setSavingGoals((prev) => prev.map((g) => ((g.id || g._id) === id ? updatedGoal : g)));
    return updatedGoal;
  };

  const deleteGoal = async (id) => {
    const res = await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al eliminar meta');
    }
    setSavingGoals((prev) => prev.filter((g) => (g.id || g._id) !== id));
  };

  // Categorías
  const addCategory = async (cat) => {
    const res = await fetch(`${API_URL}/categories`, { 
      method: 'POST', 
      headers: authHeaders(), 
      body: JSON.stringify(cat) 
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al agregar categoría');
    
    const newCategory = normalizeItem(data.category || data.data || data);
    setCategories((prev) => [...(Array.isArray(prev) ? prev : []), newCategory]);
    return newCategory;
  }; 

  const deleteCategory = async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al eliminar categoría');
    }
    setCategories((prev) => prev.filter((c) => (c.id || c._id) !== id));
  };

  // Exportar Excel limpiando referencias de memoria
  const exportToExcel = async () => {
    try {
      const res = await fetch(`${API_URL}/export/excel?month=${selectedMonth}&year=${selectedYear}`, {
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Error al descargar el archivo Excel');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_${selectedYear}_${selectedMonth + 1}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Ocurrió un error al generar la exportación en Excel.');
    }
  };

  // Filtrado y totales por año/mes
  const filteredTransactions = useMemo(() => {
    const safeTxList = Array.isArray(transactions) ? transactions : [];
    return safeTxList.filter((tx) => {
      if (!tx?.date) return false;
      const dateStr = String(tx.date).split('T')[0];
      const [yearStr, monthStr] = dateStr.split('-');
      
      const txYear = parseInt(yearStr, 10);
      const txMonth = parseInt(monthStr, 10) - 1;

      return txMonth === selectedMonth && txYear === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = useMemo(() => 
    filteredTransactions.filter((t) => t.type === 'ingreso').reduce((a, b) => a + Number(b.amount || 0), 0), 
    [filteredTransactions]
  );
  const totalExpense = useMemo(() => 
    filteredTransactions.filter((t) => t.type === 'gasto').reduce((a, b) => a + Number(b.amount || 0), 0), 
    [filteredTransactions]
  );
  const totalSavedInMonth = useMemo(() => 
    filteredTransactions.filter((t) => t.type === 'ahorro').reduce((a, b) => a + Number(b.amount || 0), 0), 
    [filteredTransactions]
  );
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
