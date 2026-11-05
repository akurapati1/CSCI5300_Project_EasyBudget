import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import '../CSS/Income.css';

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

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function Income() {
  const { state, deleteIncome, deleteExpense } = useContext(UserContext);
  const [filter, setFilter] = useState('all');

  const totalIncome = calcMonthly(state.income);
  const totalExpenses = calcMonthly(state.expenses);
  const net = totalIncome - totalExpenses;

  const now = new Date();
  const thisMonthIncome = state.income.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthExpenses = state.expenses.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const allTransactions = [
    ...thisMonthIncome.map(t => ({ ...t, type: 'income' })),
    ...thisMonthExpenses.map(t => ({ ...t, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = filter === 'all' ? allTransactions
    : allTransactions.filter(t => t.type === filter);

  return (
    <div className="income-page">
      <div className="page-header">
        <h1>Income &amp; Expenses</h1>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">Total Income</div>
          <div className="summary-card-value income">${totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Total Expenses</div>
          <div className="summary-card-value expense">${totalExpenses.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">{net >= 0 ? 'Net Savings' : 'Deficit'}</div>
          <div className={`summary-card-value ${net >= 0 ? 'net-positive' : 'net-negative'}`}>
            {net >= 0 ? '+' : ''}${net.toFixed(2)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Savings Rate</div>
          <div className={`summary-card-value ${net >= 0 ? 'net-positive' : 'net-negative'}`}>
            {totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(1) : '0.0'}%
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="transactions-panel">
        <div className="panel-header">
          <span className="panel-title">Transactions</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'income', 'expense'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: filter === f ? 'rgba(99,102,241,0.4)' : 'var(--border)',
                  background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: filter === f ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="panel-body">
          {filtered.length === 0 ? (
            <div className="empty-msg">No transactions this month. Add some from the Home page.</div>
          ) : (
            <div className="all-transactions">
              {filtered.map((t, i) => (
                <div className="transaction-row" key={t._id || i}>
                  <div className="tr-left">
                    <div className={`tr-dot ${t.type}`} />
                    <div>
                      <div className="tr-desc">{t.description}</div>
                      <div className="tr-date">{formatDate(t.date)}</div>
                    </div>
                  </div>
                  <div className="tr-right">
                    <span className={`tr-freq`}>{t.frequency}</span>
                    <span className={`tr-amount ${t.type}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                    {t._id && (
                      <button
                        onClick={() => t.type === 'income' ? deleteIncome(t._id) : deleteExpense(t._id)}
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-dim)',
                          cursor: 'pointer', fontSize: 14, padding: '4px', borderRadius: 4,
                          transition: 'color 0.2s'
                        }}
                        title="Delete"
                      >✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Income;
