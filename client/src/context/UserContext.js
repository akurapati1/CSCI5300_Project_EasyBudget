import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    income: [],
    expenses: [],
    savingsGoals: [],
    loading: false,
    error: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                income: action.payload.user.income || [],
                expenses: action.payload.user.expenses || [],
                savingsGoals: action.payload.user.savingsGoals || [],
                loading: false,
                error: null
            };
        case 'LOGOUT':
            localStorage.removeItem('token');
            return { ...initialState, token: null };
        case 'ADD_INCOME':
            return { ...state, income: [...state.income, action.payload] };
        case 'ADD_EXPENSE':
            return { ...state, expenses: [...state.expenses, action.payload] };
        case 'ADD_GOAL':
            return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };
        case 'DELETE_INCOME':
            return { ...state, income: state.income.filter(i => i._id !== action.payload) };
        case 'DELETE_EXPENSE':
            return { ...state, expenses: state.expenses.filter(e => e._id !== action.payload) };
        case 'DELETE_GOAL':
            return { ...state, savingsGoals: state.savingsGoals.filter(g => g._id !== action.payload) };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Keep axios auth header in sync with token
    useEffect(() => {
        if (state.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [state.token]);

    // Rehydrate user data from server on mount/refresh if token exists
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || state.user) return;

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'SET_LOADING', payload: true });

        axios.get(`${API}/auth/me`)
            .then(res => {
                dispatch({
                    type: 'SET_USER',
                    payload: { user: res.data, token }
                });
            })
            .catch(() => {
                // Token invalid or expired — clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch({ type: 'LOGOUT' });
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addIncome = async (incomeData) => {
        const res = await axios.post(`${API}/api/budget/income`, incomeData);
        dispatch({ type: 'ADD_INCOME', payload: res.data });
    };

    const addExpense = async (expenseData) => {
        const res = await axios.post(`${API}/api/budget/expense`, expenseData);
        dispatch({ type: 'ADD_EXPENSE', payload: res.data });
    };

    const addSavingGoal = async (goalData) => {
        const res = await axios.post(`${API}/api/budget/saving`, goalData);
        dispatch({ type: 'ADD_GOAL', payload: res.data });
    };

    const deleteIncome = async (id) => {
        await axios.delete(`${API}/api/budget/income/${id}`);
        dispatch({ type: 'DELETE_INCOME', payload: id });
    };

    const deleteExpense = async (id) => {
        await axios.delete(`${API}/api/budget/expense/${id}`);
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
    };

    const deleteSavingGoal = async (id) => {
        await axios.delete(`${API}/api/budget/saving/${id}`);
        dispatch({ type: 'DELETE_GOAL', payload: id });
    };

    return (
        <UserContext.Provider value={{ state, dispatch, addIncome, addExpense, addSavingGoal, deleteIncome, deleteExpense, deleteSavingGoal }}>
            {children}
        </UserContext.Provider>
    );
};
