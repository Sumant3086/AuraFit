import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, Tooltip, Legend
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/* KPI value colors — accessible in both light and dark themes */
const KPI_THEME = {
  revenue:    { dark: '#F59E0B', light: '#B45309' },
  members:    { dark: '#22C55E', light: '#16A34A' },
  conversion: { dark: '#06B6D4', light: '#0E7490' },
  churnGood:  { dark: '#22C55E', light: '#16A34A' },
  churnBad:   { dark: '#F97316', light: '#C2410C' },
  dau:        { dark: '#8B5CF6', light: '#6D28D9' },
  arpu:       { dark: '#F97316', light: '#C2410C' },
  scoreGood:  { dark: '#22C55E', light: '#16A34A' },
  scoreMid:   { dark: '#F59E0B', light: '#B45309' },
  scoreBad:   { dark: '#EF4444', light: '#DC2626' },
};

/* Reads the current theme from the document */
function getThemeMode() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function themeColor(key) {
  const mode = getThemeMode();
  return KPI_THEME[key][mode];
}

const KPICard = ({ label, value, sub, colorKey, icon, trend }) => {
  const color = themeColor(colorKey || 'dau');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--r-xl)',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${color}10`, borderRadius: '0 0 0 80px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</p>
          <p style={{ color, fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
          {sub && <p style={{ color: 'var(--text-3)', fontSize: 12, margin: '6px 0 0' }}>{sub}</p>}
        </div>
        <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: trend >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 12, fontWeight: 700 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span style={{ color: 'var(--text-4)', fontSize: 11 }}>vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default function AdminKPIBoard() {
  const { apiClient } = useAuth();
  const [kpis, setKpis]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/kpis');
      setKpis(res.data.data);
    } catch {
      setError('Failed to load KPI data. Ensure you have admin access.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton" style={{ borderRadius: 'var(--r-xl)', height: 100 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', margin: 0, fontSize: 13 }}>{error}</p>
      </div>
    );
  }

  if (!kpis) return null;

  const cohortLabels = kpis.cohorts?.map(c => c.month) || [];
  const cohortData   = kpis.cohorts?.map(c => c.users) || [];
  const planColors   = ['#8B5CF6', '#06B6D4', '#F59E0B'];
  const planLabels   = Object.keys(kpis.planBreakdown || {});
  const planValues   = planLabels.map(k => kpis.planBreakdown[k]);

  const gridColor    = 'rgba(128,128,128,0.10)';
  const tickColor    = 'var(--text-4)';

  /* Note: Chart.js options don't support CSS vars directly — use neutral values */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: getThemeMode() === 'light' ? '#ffffff' : '#1e1e1e',
        borderColor: getThemeMode() === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: getThemeMode() === 'light' ? '#111111' : '#f5f5f5',
        bodyColor:  getThemeMode() === 'light' ? '#444444' : '#9f9f9f',
        padding: 10,
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: '#888', font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: '#888', font: { size: 11 } } },
    },
  };

  function scoreColor(condition1, condition2) {
    if (condition1) return themeColor('scoreGood');
    if (condition2) return themeColor('scoreMid');
    return themeColor('scoreBad');
  }

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KPICard label="Monthly Recurring Revenue" value={`₹${(kpis.mrr || 0).toLocaleString()}`} sub={`ARR: ₹${(kpis.arr || 0).toLocaleString()}`} colorKey="revenue" icon="💰" trend={kpis.growthRate} />
        <KPICard label="Active Members" value={kpis.activeMemberCount || 0} sub={`+${kpis.newThisMonth} this month`} colorKey="members" icon="👥" />
        <KPICard label="Conversion Rate" value={`${kpis.conversionRate}%`} sub="Free → Paid" colorKey="conversion" icon="📈" />
        <KPICard label="Churn Rate" value={`${kpis.churnRate}%`} sub={`${kpis.retentionRate}% retention`} colorKey={kpis.churnRate < 5 ? 'churnGood' : 'churnBad'} icon="📉" />
        <KPICard label="Daily Active Users" value={kpis.dailyActive || 0} sub={`${kpis.dauMauRatio}% DAU/MAU`} colorKey="dau" icon="⚡" />
        <KPICard label="Avg Revenue / User" value={`₹${(kpis.arpu || 0).toLocaleString()}`} sub="All time ARPU" colorKey="arpu" icon="💎" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 20, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Monthly User Growth</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: cohortLabels,
                datasets: [{
                  data: cohortData,
                  backgroundColor: cohortLabels.map((_, i) =>
                    i === cohortLabels.length - 1 ? '#8B5CF6' : 'rgba(139,92,246,0.3)'
                  ),
                  borderRadius: 6,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 20, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Revenue by Plan</h3>
          {planLabels.length > 0 ? (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <Doughnut
                  data={{
                    labels: planLabels,
                    datasets: [{ data: planValues, backgroundColor: planColors, borderWidth: 0, hoverOffset: 4 }],
                  }}
                  options={{ ...chartOptions, cutout: '70%', scales: undefined }}
                />
              </div>
              <div style={{ flex: 1 }}>
                {planLabels.map((plan, i) => (
                  <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: planColors[i], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{plan}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0, fontSize: 13 }}>{planValues[i]}</p>
                      <p style={{ color: 'var(--text-4)', fontSize: 11, margin: 0 }}>members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 14 }}>
              No paid memberships yet
            </div>
          )}
        </div>
      </div>

      {/* Business health */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: 20, boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Business Health Score</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            {
              label: 'Growth',
              value: kpis.growthRate > 10 ? 'Excellent' : kpis.growthRate > 0 ? 'Good' : 'Needs Attention',
              color: scoreColor(kpis.growthRate > 10, kpis.growthRate > 0),
              detail: `${kpis.growthRate > 0 ? '+' : ''}${kpis.growthRate}% MoM`,
            },
            {
              label: 'Retention',
              value: kpis.retentionRate > 90 ? 'Excellent' : kpis.retentionRate > 80 ? 'Good' : 'At Risk',
              color: scoreColor(kpis.retentionRate > 90, kpis.retentionRate > 80),
              detail: `${kpis.retentionRate}% retained`,
            },
            {
              label: 'Engagement',
              value: kpis.dauMauRatio > 20 ? 'High' : kpis.dauMauRatio > 10 ? 'Medium' : 'Low',
              color: scoreColor(kpis.dauMauRatio > 20, kpis.dauMauRatio > 10),
              detail: `${kpis.dauMauRatio}% DAU/MAU`,
            },
            {
              label: 'Conversion',
              value: kpis.conversionRate > 20 ? 'High' : kpis.conversionRate > 10 ? 'Medium' : 'Low',
              color: scoreColor(kpis.conversionRate > 20, kpis.conversionRate > 10),
              detail: `${kpis.conversionRate}% free→paid`,
            },
          ].map(h => (
            <div key={h.label} style={{ background: 'var(--surface-3)', borderRadius: 'var(--r-md)', padding: '14px 16px', border: '1px solid var(--border-1)' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{h.label}</p>
              <p style={{ color: h.color, fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>{h.value}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>{h.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
