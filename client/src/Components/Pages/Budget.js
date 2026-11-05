import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

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

const categoryColors = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6'
];

function Budget() {
  const { state } = useContext(UserContext);

  const totalIncome = calcMonthly(state.income);
  const totalExpenses = calcMonthly(state.expenses);
  const net = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  // Group expenses by description
  const expenseGroups = state.expenses.reduce((acc, t) => {
    const now = new Date();
    const d = new Date(t.date);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return acc;
    const key = t.description;
    if (!acc[key]) acc[key] = 0;
    const amount = t.frequency === 'bi-weekly' ? t.amount * 2
      : t.frequency === 'weekly' ? t.amount * 4 : t.amount;
    acc[key] += amount;
    return acc;
  }, {});

  const expenseEntries = Object.entries(expenseGroups).sort((a, b) => b[1] - a[1]);

  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20
  };

  const label = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Budget Overview</h1>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Income', value: `$${totalIncome.toFixed(2)}`, color: '#34d399' },
          { label: 'Expenses', value: `$${totalExpenses.toFixed(2)}`, color: '#f87171' },
          { label: net >= 0 ? 'Savings' : 'Deficit', value: `${net >= 0 ? '+' : ''}$${net.toFixed(2)}`, color: net >= 0 ? '#60a5fa' : '#f87171' },
          { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? '#34d399' : savingsRate >= 0 ? '#f59e0b' : '#f87171' }
        ].map(item => (
          <div key={item.label} style={card}>
            <div style={label}>{item.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      {totalIncome > 0 && (
        <div style={card}>
          <div style={{ ...label, marginBottom: 12 }}>Budget Utilization</div>
          <div style={{ background: 'var(--bg)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min((totalExpenses / totalIncome) * 100, 100)}%`,
              background: totalExpenses / totalIncome > 0.9 ? '#ef4444'
                : totalExpenses / totalIncome > 0.7 ? '#f59e0b' : '#10b981',
              borderRadius: 8,
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>{((totalExpenses / totalIncome) * 100).toFixed(1)}% of income spent</span>
            <span>${(totalIncome - totalExpenses).toFixed(2)} remaining</span>
          </div>
        </div>
      )}

      {/* Expense breakdown */}
      <div style={card}>
        <div style={{ ...label, marginBottom: 16 }}>Expense Breakdown</div>
        {expenseEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            No expenses this month. Add some from the Home page.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {expenseEntries.map(([name, amount], i) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ${amount.toFixed(2)} <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: categoryColors[i % categoryColors.length],
                      borderRadius: 4,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Budget;
