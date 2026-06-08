import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiTrendingDown, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  apiFetch, fmtDate, fmtCurrency, daysSince, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SelectFilter, ActionBtn, EmptyState, LoadingSkeleton, Pagination,
} from './shared';

export default function RetentionChurn() {
  const [overview, setOverview] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [atRiskTotal, setAtRiskTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [atRiskLoading, setAtRiskLoading] = useState(true);
  const [days, setDays] = useState('14');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/retention/overview');
      setOverview(r.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, []);

  const loadAtRisk = useCallback(async () => {
    setAtRiskLoading(true);
    try {
      const r = await apiFetch(`/retention/at-risk?days=${days}&page=${page}&limit=50`);
      setAtRisk(r.data || []);
      setAtRiskTotal(r.total || 0);
    } catch (err) { toast.error(err.message); }
    finally { setAtRiskLoading(false); }
  }, [days, page]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { loadAtRisk(); }, [loadAtRisk]);

  const cohortData = overview?.cohortData || [];
  const atRiskCount = overview?.atRiskCount || 0;
  const avgLTV = overview?.avgLTV || 0;
  const activeMemberCount = overview?.activeMemberCount || 0;
  const pages = Math.ceil(atRiskTotal / 50);

  const avgChurn = cohortData.length > 0
    ? Math.round(cohortData.reduce((s, c) => s + (100 - c.retentionRate), 0) / cohortData.length)
    : 0;

  return (
    <div>
      <ModuleHeader title="Retention & Churn Analytics" description="Cohort analysis, at-risk members, lifetime value, and retention trends" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Active Members" value={activeMemberCount} color="var(--green, #22c55e)" />
        <KPICard label="At-Risk Members" value={atRiskCount} color="var(--red, #ef4444)" sub="Inactive 14+ days" />
        <KPICard label="Avg LTV" value={fmtCurrency(avgLTV)} color="var(--accent)" sub="Per member to date" />
        <KPICard label="Avg Churn Rate" value={`${avgChurn}%`} color="var(--amber, #f59e0b)" sub="6-month average" />
      </div>

      {loading ? <LoadingSkeleton rows={6} height={60} /> : !overview ? null : (
        <>
          {/* Cohort charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* New Users by month */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 18 }}>
              <p style={{ margin: '0 0 14px', color: 'var(--text-1)', fontWeight: 700, fontSize: 14 }}>New Member Acquisition</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 8 }} />
                  <Bar dataKey="newUsers" name="New Members" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Retention rate trend */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 18 }}>
              <p style={{ margin: '0 0 14px', color: 'var(--text-1)', fontWeight: 700, fontSize: 14 }}>Retention Rate by Cohort</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 8 }} formatter={v => `${v}%`} />
                  <Line type="monotone" dataKey="retentionRate" name="Retention %" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cohort table */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <p style={{ margin: '0 0 14px', color: 'var(--text-1)', fontWeight: 700, fontSize: 14 }}>Cohort Summary</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-3)' }}>
                    {['Month', 'New Members', 'Retained', 'Churned', 'Retention Rate'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-1)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map(c => (
                    <tr key={c.month} style={{ borderBottom: '1px solid var(--border-1)' }}>
                      <td style={{ padding: '9px 14px', color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{c.month}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--text-2)', fontSize: 13 }}>{c.newUsers}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--green, #22c55e)', fontWeight: 600, fontSize: 13 }}>{c.retained}</td>
                      <td style={{ padding: '9px 14px', color: 'var(--red, #ef4444)', fontWeight: 600, fontSize: 13 }}>{c.churned}</td>
                      <td style={{ padding: '9px 14px', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 5, background: 'var(--surface-3)', borderRadius: 999 }}>
                            <div style={{ width: `${c.retentionRate}%`, height: '100%', background: c.retentionRate >= 70 ? 'var(--green, #22c55e)' : c.retentionRate >= 40 ? 'var(--amber, #f59e0b)' : 'var(--red, #ef4444)', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{c.retentionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* At-Risk Members */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <FiAlertTriangle size={16} color="var(--amber, #f59e0b)" />
        <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: 16, fontWeight: 700 }}>
          At-Risk Members ({atRiskTotal})
        </h3>
        <SelectFilter value={days} onChange={v => { setDays(v); setPage(1); }}
          options={[{ value: '7', label: '7 days inactive' }, { value: '14', label: '14 days inactive' }, { value: '30', label: '30 days inactive' }, { value: '60', label: '60 days inactive' }]}
          placeholder="Inactive threshold" />
      </div>
      <p style={{ margin: '0 0 16px', color: 'var(--text-3)', fontSize: 13 }}>
        Active paying members who haven't logged in for {days}+ days — high churn risk
      </p>

      <TableCard>
        {atRiskLoading ? <LoadingSkeleton /> : atRisk.length === 0 ? (
          <EmptyState icon={FiTrendingDown} title="No at-risk members" sub={`No active members inactive for ${days}+ days`} />
        ) : (
          <Table heads={['Member', 'Membership', 'Last Login', 'Days Inactive', 'Streak', 'Points', 'Joined']}>
            {atRisk.map(u => {
              const inactive = daysSince(u.lastLogin);
              return (
                <TR key={u._id}>
                  <TD>
                    <div>
                      <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{u.email}</div>
                    </div>
                  </TD>
                  <TD><StatusBadge status={u.membership?.toLowerCase() || 'none'} label={u.membership} /></TD>
                  <TD style={{ color: 'var(--amber, #f59e0b)', fontSize: 12 }}>
                    {u.lastLogin ? fmtDate(u.lastLogin) : 'Never logged in'}
                  </TD>
                  <TD>
                    <span style={{
                      color: inactive > 60 ? 'var(--red, #ef4444)' : inactive > 30 ? 'var(--orange, #f97316)' : 'var(--amber, #f59e0b)',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {inactive ?? '—'}d
                    </span>
                  </TD>
                  <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{u.currentStreak || 0}</TD>
                  <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{(u.points || 0).toLocaleString()}</TD>
                  <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{fmtDate(u.createdAt)}</TD>
                </TR>
              );
            })}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={atRiskTotal} limit={50} onPage={setPage} />
      </TableCard>
    </div>
  );
}
