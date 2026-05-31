import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, Tooltip, Legend
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a1a',
      borderColor: '#333',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: '#ccc',
      padding: 10,
    },
  },
};

const KPICard = ({ label, value, sub, color = '#9d00ff', icon, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: '#111', border: '1px solid #1a1a1a', borderRadius: 16,
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}
  >
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${color}08`, borderRadius: '0 0 0 80px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#555', fontSize: 12, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
        <p style={{ color: color, fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>{sub}</p>}
      </div>
      <div style={{ fontSize: 28 }}>{icon}</div>
    </div>
    {trend !== undefined && (
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: trend >= 0 ? '#00c853' : '#ff4444', fontSize: 12, fontWeight: 700 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span style={{ color: '#444', fontSize: 11 }}>vs last month</span>
      </div>
    )}
  </motion.div>
);

export default function AdminKPIBoard() {
  const { apiClient } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/kpis');
      setKpis(res.data.data);
    } catch (err) {
      setError('Failed to load KPI data. Ensure you have admin access.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ background: '#111', borderRadius: 16, height: 100, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#1a0505', border: '1px solid #ff444433', borderRadius: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ color: '#ff4444', margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!kpis) return null;

  const cohortLabels = kpis.cohorts?.map(c => c.month) || [];
  const cohortData = kpis.cohorts?.map(c => c.users) || [];

  const planColors = ['#9d00ff', '#00d4ff', '#ffd700'];
  const planLabels = Object.keys(kpis.planBreakdown || {});
  const planValues = planLabels.map(k => kpis.planBreakdown[k]);

  return (
    <div>
      {/* Top KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KPICard label="Monthly Recurring Revenue" value={`₹${(kpis.mrr || 0).toLocaleString()}`} sub={`ARR: ₹${((kpis.arr || 0)).toLocaleString()}`} color="#ffd700" icon="💰" trend={kpis.growthRate} />
        <KPICard label="Active Members" value={kpis.activeMemberCount || 0} sub={`+${kpis.newThisMonth} this month`} color="#00c853" icon="👥" />
        <KPICard label="Conversion Rate" value={`${kpis.conversionRate}%`} sub="Free → Paid" color="#00d4ff" icon="📈" />
        <KPICard label="Churn Rate" value={`${kpis.churnRate}%`} sub={`${kpis.retentionRate}% retention`} color={kpis.churnRate < 5 ? '#00c853' : '#ff6b35'} icon="📉" />
        <KPICard label="Daily Active Users" value={kpis.dailyActive || 0} sub={`${kpis.dauMauRatio}% DAU/MAU`} color="#9d00ff" icon="⚡" />
        <KPICard label="Avg Revenue / User" value={`₹${(kpis.arpu || 0).toLocaleString()}`} sub="All time ARPU" color="#ff6b35" icon="💎" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Cohort growth */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Monthly User Growth</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: cohortLabels,
                datasets: [{
                  data: cohortData,
                  backgroundColor: cohortLabels.map((_, i) =>
                    i === cohortLabels.length - 1 ? '#9d00ff' : '#9d00ff44'
                  ),
                  borderRadius: 6,
                }],
              }}
              options={{
                ...chartDefaults,
                scales: {
                  x: { grid: { color: '#1a1a1a' }, ticks: { color: '#555', font: { size: 11 } } },
                  y: { grid: { color: '#1a1a1a' }, ticks: { color: '#555', font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>

        {/* Revenue by plan */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Revenue by Plan</h3>
          {planLabels.length > 0 ? (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <Doughnut
                  data={{
                    labels: planLabels,
                    datasets: [{
                      data: planValues,
                      backgroundColor: planColors,
                      borderWidth: 0,
                      hoverOffset: 4,
                    }],
                  }}
                  options={{
                    ...chartDefaults,
                    cutout: '70%',
                    plugins: { ...chartDefaults.plugins, legend: { display: false } },
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                {planLabels.map((plan, i) => (
                  <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: planColors[i] }} />
                      <span style={{ color: '#ccc', fontSize: 13 }}>{plan}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 13 }}>{planValues[i]}</p>
                      <p style={{ color: '#555', fontSize: 11, margin: 0 }}>members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555', fontSize: 14 }}>
              No paid memberships yet
            </div>
          )}
        </div>
      </div>

      {/* Business health indicators */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Business Health Score</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            {
              label: 'Growth', value: kpis.growthRate > 10 ? 'Excellent' : kpis.growthRate > 0 ? 'Good' : 'Needs Attention',
              color: kpis.growthRate > 10 ? '#00c853' : kpis.growthRate > 0 ? '#ffd700' : '#ff4444',
              detail: `${kpis.growthRate > 0 ? '+' : ''}${kpis.growthRate}% MoM`,
            },
            {
              label: 'Retention', value: kpis.retentionRate > 90 ? 'Excellent' : kpis.retentionRate > 80 ? 'Good' : 'At Risk',
              color: kpis.retentionRate > 90 ? '#00c853' : kpis.retentionRate > 80 ? '#ffd700' : '#ff4444',
              detail: `${kpis.retentionRate}% retained`,
            },
            {
              label: 'Engagement', value: kpis.dauMauRatio > 20 ? 'High' : kpis.dauMauRatio > 10 ? 'Medium' : 'Low',
              color: kpis.dauMauRatio > 20 ? '#00c853' : kpis.dauMauRatio > 10 ? '#ffd700' : '#ff4444',
              detail: `${kpis.dauMauRatio}% DAU/MAU`,
            },
            {
              label: 'Conversion', value: kpis.conversionRate > 20 ? 'High' : kpis.conversionRate > 10 ? 'Medium' : 'Low',
              color: kpis.conversionRate > 20 ? '#00c853' : kpis.conversionRate > 10 ? '#ffd700' : '#ff4444',
              detail: `${kpis.conversionRate}% free→paid`,
            },
          ].map(h => (
            <div key={h.label} style={{ background: '#0a0a0a', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ color: '#555', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>{h.label}</p>
              <p style={{ color: h.color, fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{h.value}</p>
              <p style={{ color: '#444', fontSize: 12, margin: 0 }}>{h.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
