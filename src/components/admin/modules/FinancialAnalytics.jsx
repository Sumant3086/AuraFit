import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiDownload } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiFetch, fmtCurrency, ModuleHeader, KPICard, FilterBar, DateInput, ActionBtn, EmptyState, LoadingSkeleton } from './shared';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const PRESET_RANGES = [
  { label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: '90D', days: 90 }, { label: '180D', days: 180 },
];

export default function FinancialAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const applyPreset = (days) => {
    const f = new Date(Date.now() - days * 86400000);
    setFrom(f.toISOString().split('T')[0]);
    setTo(new Date().toISOString().split('T')[0]);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const r = await apiFetch(`/revenue?${params}`);
      setData(r.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary || {};
  const dayData = data?.ordersByDay || [];
  const planData = (data?.membershipRevenue || []).map(p => ({
    name: (p._id || 'Unknown').charAt(0).toUpperCase() + (p._id || '').slice(1),
    value: p.revenue,
    count: p.count,
  }));
  const topProducts = data?.topProducts || [];
  const methodData = data?.revenueByMethod || [];

  return (
    <div>
      <ModuleHeader
        title="Revenue & Financial Analytics"
        description="Daily revenue trends, membership revenue, top products, and payment method breakdown"
      />

      {/* Preset + date filters */}
      <FilterBar>
        {PRESET_RANGES.map(p => (
          <button key={p.label} onClick={() => applyPreset(p.days)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {p.label}
          </button>
        ))}
        <DateInput value={from} onChange={setFrom} label="From" />
        <DateInput value={to} onChange={setTo} label="To" />
        <ActionBtn onClick={load} variant="primary">Apply</ActionBtn>
      </FilterBar>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard label="Total Revenue" value={fmtCurrency(summary.grandTotal)} color="var(--green, #22c55e)" sub={`${from || '90 days'} to ${to || 'today'}`} />
        <KPICard label="Shop Revenue" value={fmtCurrency(summary.totalOrderRevenue)} sub="Product sales" />
        <KPICard label="Membership Revenue" value={fmtCurrency(summary.totalMembershipRevenue)} sub="Subscription sales" />
        <KPICard label="Avg Daily Revenue" value={fmtCurrency(dayData.length > 0 ? Math.round((summary.totalOrderRevenue || 0) / Math.max(1, dayData.length)) : 0)} sub="Based on days with orders" />
      </div>

      {loading ? <LoadingSkeleton rows={8} height={60} /> : !data ? (
        <EmptyState icon={FiTrendingUp} title="No data available" sub="Check date range or API connection" />
      ) : (
        <>
          {/* Revenue trend chart */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <p style={{ margin: '0 0 16px', color: 'var(--text-1)', fontWeight: 700, fontSize: 15 }}>Daily Order Revenue</p>
            {dayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dayData.map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 8 }}
                    formatter={(v, n) => [n === 'revenue' ? fmtCurrency(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No order data for this period</p>
            )}
          </div>

          {/* Membership + Products row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Membership revenue pie */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20 }}>
              <p style={{ margin: '0 0 16px', color: 'var(--text-1)', fontWeight: 700, fontSize: 15 }}>Membership Revenue by Plan</p>
              {planData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                        {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                    {planData.map((p, i) => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: 'var(--text-2)' }}>{p.name}: {fmtCurrency(p.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No membership data</p>
              )}
            </div>

            {/* Top Products */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20 }}>
              <p style={{ margin: '0 0 16px', color: 'var(--text-1)', fontWeight: 700, fontSize: 15 }}>Top Revenue Products</p>
              {topProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topProducts.slice(0, 8).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p._id}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)' }}>{p.qty} units sold</p>
                      </div>
                      <span style={{ color: 'var(--green, #22c55e)', fontWeight: 700, fontSize: 13, flexShrink: 0, marginLeft: 12 }}>{fmtCurrency(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No product sales</p>
              )}
            </div>
          </div>

          {/* Payment Method Bar */}
          {methodData.length > 0 && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20 }}>
              <p style={{ margin: '0 0 16px', color: 'var(--text-1)', fontWeight: 700, fontSize: 15 }}>Revenue by Payment Method</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={methodData.map(m => ({ method: m._id || 'Unknown', amount: m.amount, orders: m.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" />
                  <XAxis dataKey="method" tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 8 }} formatter={v => fmtCurrency(v)} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
