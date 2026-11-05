import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import CalendarComponent from './Calendar';
import './CSS/Home.css';

const Home = ({ user }) => {
  const { state, addIncome, addExpense, deleteIncome, deleteExpense } = useContext(UserContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modal, setModal] = useState(null); // 'option' | 'income' | 'expense'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('income');

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModal('option');
  };

  const closeModal = () => {
    setModal(null);
    setAmount('');
    setDescription('');
    setFrequency('monthly');
  };

  const calcMonthly = (transactions) => {
    const now = new Date();
    return transactions.reduce((total, t) => {
      const d = new Date(t.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        if (t.frequency === 'bi-weekly') return total + t.amount * 2;
        if (t.frequency === 'weekly') return total + t.amount * 4;
        return total + t.amount;
      }
      return total;
    }, 0);
  };

  const totalIncome = calcMonthly(state.income);
  const totalExpenses = calcMonthly(state.expenses);
  const net = totalIncome - totalExpenses;

  const handleSubmit = async (type) => {
    if (!amount || !description) return;
    setLoading(true);
    try {
      const payload = {
        date: selectedDate || new Date(),
        amount: parseFloat(amount),
        description,
        frequency
      };
      if (type === 'income') await addIncome(payload);
      else await addExpense(payload);
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const currentMonthTransactions = (list) =>
    list.filter(t => {
      const d = new Date(t.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

  const incomeThisMonth = currentMonthTransactions(state.income);
  const expensesThisMonth = currentMonthTransactions(state.expenses);

  return (
    <div>
      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value income">${totalIncome.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value expense">${totalExpenses.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{net >= 0 ? 'Net Savings' : 'Deficit'}</div>
          <div className={`stat-value ${net >= 0 ? 'savings' : 'deficit'}`}>
            {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="home-grid">
        {/* Calendar */}
        <div>
          <div className="calendar-section">
            <div className="section-title">📅 Click a date to add a transaction</div>
            <CalendarComponent onDateClick={handleDateClick} />
          </div>
        </div>

        {/* Transactions */}
        <div className="transactions-section">
          <div className="section-title">This Month</div>
          <div className="transactions-tabs">
            <button
              className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
              onClick={() => setActiveTab('income')}
            >
              Income ({incomeThisMonth.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('expense')}
            >
              Expenses ({expensesThisMonth.length})
            </button>
          </div>

          <div className="transaction-list">
            {activeTab === 'income' && (
              incomeThisMonth.length === 0
                ? <div className="empty-state">No income recorded this month</div>
                : incomeThisMonth.map((item, i) => (
                  <div className="transaction-item" key={item._id || i}>
                    <div className="transaction-info">
                      <span className="transaction-desc">{item.description}</span>
                      <span className="transaction-meta">
                        {formatDate(item.date)}
                        <span className="freq-badge">{item.frequency}</span>
                      </span>
                    </div>
                    <div className="transaction-right">
                      <span className="transaction-amount income">+${item.amount.toFixed(2)}</span>
                      {item._id && (
                        <button className="delete-btn" onClick={() => deleteIncome(item._id)} title="Delete">✕</button>
                      )}
                    </div>
                  </div>
                ))
            )}
            {activeTab === 'expense' && (
              expensesThisMonth.length === 0
                ? <div className="empty-state">No expenses recorded this month</div>
                : expensesThisMonth.map((item, i) => (
                  <div className="transaction-item" key={item._id || i}>
                    <div className="transaction-info">
                      <span className="transaction-desc">{item.description}</span>
                      <span className="transaction-meta">
                        {formatDate(item.date)}
                        <span className="freq-badge">{item.frequency}</span>
                      </span>
                    </div>
                    <div className="transaction-right">
                      <span className="transaction-amount expense">-${item.amount.toFixed(2)}</span>
                      {item._id && (
                        <button className="delete-btn" onClick={() => deleteExpense(item._id)} title="Delete">✕</button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'option' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Add Transaction for {selectedDate ? formatDate(selectedDate) : 'today'}</h2>
            <div className="modal-actions">
              <button className="btn-income" onClick={() => setModal('income')}>+ Income</button>
              <button className="btn-expense" onClick={() => setModal('expense')}>+ Expense</button>
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {(modal === 'income' || modal === 'expense') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'income' ? '💰 Add Income' : '💸 Add Expense'}</h2>
            <input
              className="modal-input"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              autoFocus
            />
            <input
              className="modal-input"
              type="text"
              placeholder={modal === 'income' ? 'Income source (e.g. Salary)' : 'What was it for?'}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <select className="modal-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="modal-actions">
              <button
                className={modal === 'income' ? 'btn-income' : 'btn-expense'}
                onClick={() => handleSubmit(modal)}
                disabled={!amount || !description || loading}
              >
                {loading ? 'Saving...' : `Add ${modal === 'income' ? 'Income' : 'Expense'}`}
              </button>
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
