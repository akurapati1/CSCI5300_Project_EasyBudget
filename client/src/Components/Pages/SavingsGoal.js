import React, { useContext, useState, useEffect } from 'react';
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

const SavingsGoal = () => {
  const { state, addSavingGoal, deleteSavingGoal } = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [allocatedPct, setAllocatedPct] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [monthlyDisposable, setMonthlyDisposable] = useState(0);

  useEffect(() => {
    const income = calcMonthly(state.income);
    const expenses = calcMonthly(state.expenses);
    setMonthlyDisposable(income - expenses);
  }, [state.income, state.expenses]);

  const calcMonths = (amount, pct) => {
    const monthly = (monthlyDisposable * pct) / 100;
    if (monthly <= 0) return null;
    return Math.ceil(amount / monthly);
  };

  const handleAdd = async () => {
    setError('');
    const amount = parseFloat(goalAmount);
    const pct = parseFloat(allocatedPct);
    if (!goalName.trim()) { setError('Goal name is required.'); return; }
    if (isNaN(amount) || amount <= 0) { setError('Goal amount must be greater than 0.'); return; }
    if (isNaN(pct) || pct <= 0 || pct > 100) { setError('Percentage must be between 1 and 100.'); return; }

    setLoading(true);
    try {
      await addSavingGoal({ goalName: goalName.trim(), goalAmount: amount, allocatedPercentage: pct });
      setGoalName('');
      setGoalAmount('');
      setAllocatedPct('');
      setShowForm(false);
    } catch (err) {
      setError('Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Savings Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + New Goal
        </button>
      </div>

      {/* Disposable income info */}
      <div style={{ ...card, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Monthly Disposable</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: monthlyDisposable >= 0 ? '#34d399' : '#f87171' }}>
            ${monthlyDisposable.toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Active Goals</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{state.savingsGoals.length}</div>
        </div>
      </div>

      {/* Goals list */}
      {state.savingsGoals.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No savings goals yet</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Create your first goal to start tracking your progress.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {state.savingsGoals.map((goal, i) => {
            const months = calcMonths(goal.goalAmount, goal.allocatedPercentage);
            const monthlyContrib = (monthlyDisposable * goal.allocatedPercentage) / 100;
            return (
              <div key={goal._id || i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{goal.goalName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      Target: <span style={{ color: 'var(--text)', fontWeight: 500 }}>${goal.goalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  {goal._id && (
                    <button
                      onClick={() => deleteSavingGoal(goal._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: 4 }}
                    >✕</button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Allocation</span>
                    <span style={{ color: 'var(--primary-light)', fontWeight: 500 }}>{goal.allocatedPercentage}% of disposable</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Monthly contribution</span>
                    <span style={{ color: '#34d399', fontWeight: 500 }}>
                      {monthlyContrib > 0 ? `$${monthlyContrib.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Time to goal</span>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                      {months === null ? 'Increase income first' : `${months} month${months !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Progress bar (visual only, based on allocation) */}
                <div style={{ marginTop: 16, background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(goal.allocatedPercentage, 100)}%`,
                    background: 'linear-gradient(90deg, #6366f1, #10b981)',
                    borderRadius: 4
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 28, width: '100%', maxWidth: 400,
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>🎯 New Savings Goal</h2>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 14
              }}>{error}</div>
            )}
            {[
              { placeholder: 'Goal name (e.g. Emergency Fund)', value: goalName, onChange: setGoalName, type: 'text' },
              { placeholder: 'Target amount ($)', value: goalAmount, onChange: setGoalAmount, type: 'number' },
              { placeholder: 'Allocation % of disposable income', value: allocatedPct, onChange: setAllocatedPct, type: 'number' }
            ].map((field, i) => (
              <input
                key={i}
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '11px 14px', fontSize: 14, color: 'var(--text)',
                  marginBottom: 12, outline: 'none', boxSizing: 'border-box'
                }}
              />
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={handleAdd}
                disabled={loading}
                style={{
                  flex: 1, padding: 11, background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', border: 'none', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : 'Add Goal'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(''); }}
                style={{
                  padding: '11px 20px', background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, cursor: 'pointer'
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoal;
