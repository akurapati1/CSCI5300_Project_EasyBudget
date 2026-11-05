import React, { useContext } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, PointElement, LineElement, ArcElement
} from 'chart.js';
import { UserContext } from '../../context/UserContext';
import '../CSS/Chart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { size: 11 } },
      grid: { color: 'rgba(51,65,85,0.5)' }
    },
    y: {
      ticks: { color: '#64748b', font: { size: 11 } },
      grid: { color: 'rgba(51,65,85,0.5)' }
    }
  }
};

const DOUGHNUT_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16 }
    }
  }
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

const Chart = () => {
  const { state } = useContext(UserContext);

  const totalIncome = calcMonthly(state.income);
  const totalExpenses = calcMonthly(state.expenses);
  const net = totalIncome - totalExpenses;

  // Monthly trend (last 6 months)
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString('default', { month: 'short' }) });
    }
    return months;
  };

  const months = getLast6Months();

  const getMonthTotal = (transactions, month, year) =>
    transactions.reduce((total, t) => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (t.frequency === 'bi-weekly') return total + t.amount * 2;
        if (t.frequency === 'weekly') return total + t.amount * 4;
        return total + t.amount;
      }
      return total;
    }, 0);

  const trendData = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        data: months.map(m => getMonthTotal(state.income, m.month, m.year)),
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        borderColor: '#34d399',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#34d399'
      },
      {
        label: 'Expenses',
        data: months.map(m => getMonthTotal(state.expenses, m.month, m.year)),
        backgroundColor: 'rgba(248, 113, 113, 0.2)',
        borderColor: '#f87171',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f87171'
      }
    ]
  };

  const barData = {
    labels: ['Income', 'Expenses', 'Net'],
    datasets: [{
      label: 'This Month ($)',
      data: [totalIncome, totalExpenses, Math.max(net, 0)],
      backgroundColor: ['rgba(52,211,153,0.7)', 'rgba(248,113,113,0.7)', 'rgba(96,165,250,0.7)'],
      borderColor: ['#34d399', '#f87171', '#60a5fa'],
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  // Expense breakdown doughnut
  const expenseGroups = state.expenses.reduce((acc, t) => {
    const now = new Date();
    const d = new Date(t.date);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return acc;
    const amount = t.frequency === 'bi-weekly' ? t.amount * 2
      : t.frequency === 'weekly' ? t.amount * 4 : t.amount;
    acc[t.description] = (acc[t.description] || 0) + amount;
    return acc;
  }, {});

  const doughnutColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  const doughnutData = {
    labels: Object.keys(expenseGroups),
    datasets: [{
      data: Object.values(expenseGroups),
      backgroundColor: doughnutColors.slice(0, Object.keys(expenseGroups).length),
      borderColor: 'var(--bg-card)',
      borderWidth: 2
    }]
  };

  const chartCard = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20
  };

  const chartTitle = {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 16
  };

  const lineOptions = {
    ...CHART_DEFAULTS,
    plugins: {
      ...CHART_DEFAULTS.plugins,
      title: { display: false }
    }
  };

  const barOptions = {
    ...CHART_DEFAULTS,
    plugins: {
      ...CHART_DEFAULTS.plugins,
      title: { display: false }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Charts &amp; Analytics</h1>

      {/* 6-month trend */}
      <div style={chartCard}>
        <div style={chartTitle}>6-Month Income vs Expenses Trend</div>
        <Line data={trendData} options={lineOptions} />
      </div>

      <div className="chart-row">
        {/* Monthly bar */}
        <div style={chartCard}>
          <div style={chartTitle}>This Month Summary</div>
          <Bar data={barData} options={barOptions} />
        </div>

        {/* Expense breakdown */}
        <div style={chartCard}>
          <div style={chartTitle}>Expense Breakdown</div>
          {Object.keys(expenseGroups).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No expenses this month
            </div>
          ) : (
            <Doughnut data={doughnutData} options={DOUGHNUT_DEFAULTS} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chart;
