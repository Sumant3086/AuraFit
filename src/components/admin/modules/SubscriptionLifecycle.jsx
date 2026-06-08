import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiRepeat, FiDownload, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import {
  apiFetch, exportCSV, fmtCurrency, fmtDate, daysSince, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, ActionBtn, EmptyState, LoadingSkeleton, Pagination,
} from './shared';

const PLAN_OPTS = [
  { value: 'basic', label: 'Basic' }, { value: 'pro', label: 'Pro' },
  { value: 'premium', label: 'Premium' },
];
const WINDOW_OPTS = [
  { value: '7', label: 'Next 7 days' }, { value: '14', label: 'Next 14 days' },
  { value: '30', label: 'Next 30 days' }, { value: '60', label: 'Next 60 days' },
];

export default function SubscriptionLifecycle() {
  const [stats, setStats] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState('expiring'); // expiring | active | all
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [window, setWindow] = useState('30');

  const loadStats = useCallback(async () => {
    try { const r = await apiFetch('/memberships/stats'); setStats(r.data); } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (view === 'expiring') {
        const r = await apiFetch(`/memberships/expiring?days=${window}`);
        setData(r.data || []);
        setTotal(r.count || 0);
      } else {
        const params = new URLSearchParams({ page, limit: 50 });
        if (search) params.set('search', search);
        if (planFilter) params.set('plan', planFilter);
        if (view === 'active') params.set('status', 'active');
        const r = await apiFetch(`/memberships/full?${params}`);
        setData(r.data || []);
        setTotal(r.total || 0);
      }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [view, page, search, planFilter, window]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { load(); }, [load]);

  const handleExtend = async (id, days) => {
    try {
      await apiFetch(`/memberships/${id}/extend`, { method: 'PATCH', body: JSON.stringify({ days }) });
      toast.success(`Extended by ${days} days`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm) return;
    try {
      await apiFetch(`/memberships/${id}/cancel`, { method: 'PATCH' });
      toast.success('Subscription cancelled');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const byStatus = stats?.byStatus || [];
  const active = byStatus.find(s => s._id === 'active')?.count || 0;
  const expired = byStatus.find(s => s._id === 'expired')?.count || 0;
  const cancelled = byStatus.find(s => s._id === 'cancelled')?.count || 0;
  const pages = Math.ceil(total / 50);

  return (
    <div>
      <ModuleHeader
        title="Subscription Lifecycle Management"
        description="Track active subscriptions, renewals, expirations, and cancellations"
        action={
          <ActionBtn variant="export" onClick={() => exportCSV('/exports/memberships?status=active', 'active-subscriptions.csv')}>
            <FiDownload size={13} /> Export Active
          </ActionBtn>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Active Subscriptions" value={active} color="var(--green, #22c55e)" />
        <KPICard label="Total Revenue" value={fmtCurrency(stats?.totalRevenue)} color="var(--accent)" />
        <KPICard label="Expired" value={expired} color="var(--red, #ef4444)" sub="Needs renewal" />
        <KPICard label="Cancelled" value={cancelled} color="var(--text-3)" />
        {(stats?.byPlan || []).map(p => (
          <KPICard key={p._id} label={`${(p._id || '').charAt(0).toUpperCase() + (p._id || '').slice(1)}`} value={p.count} sub={fmtCurrency(p.revenue)} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ id: 'expiring', label: 'Expiring Soon' }, { id: 'active', label: 'Active' }, { id: 'all', label: 'All' }].map(v => (
          <button key={v.id} onClick={() => { setView(v.id); setPage(1); }}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-1)', cursor: 'pointer', fontWeight: 600, fontSize: 12,
              background: view === v.id ? 'var(--accent)' : 'var(--surface-2)', color: view === v.id ? '#fff' : 'var(--text-2)' }}>
            {v.label}
          </button>
        ))}
        {view === 'expiring' && (
          <SelectFilter value={window} onChange={v => { setWindow(v); setPage(1); }} options={WINDOW_OPTS} placeholder="Window" />
        )}
      </div>

      {view === 'expiring' && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10 }}>
          <FiAlertCircle size={14} color="var(--amber, #f59e0b)" />
          <span style={{ color: 'var(--amber, #f59e0b)', fontSize: 13, fontWeight: 600 }}>
            {total} subscriptions expiring in the next {window} days — consider outreach
          </span>
        </div>
      )}

      <FilterBar>
        {view !== 'expiring' && <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search member..." />}
        <SelectFilter value={planFilter} onChange={v => { setPlanFilter(v); setPage(1); }} options={PLAN_OPTS} placeholder="All Plans" />
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : data.length === 0 ? (
          <EmptyState icon={FiRepeat} title="No subscriptions" sub="Adjust filters or window" />
        ) : (
          <Table heads={['Member', 'Plan', 'Duration', 'Price', 'Start', 'End', 'Days Left', 'Status', 'Actions']}>
            {data.map(m => {
              const daysLeft = m.endDate ? Math.ceil((new Date(m.endDate) - Date.now()) / 86400000) : null;
              return (
                <TR key={m._id}>
                  <TD>
                    <div>
                      <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{m.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{m.email}</div>
                    </div>
                  </TD>
                  <TD><StatusBadge status={m.plan} label={(m.plan || '').charAt(0).toUpperCase() + (m.plan || '').slice(1)} /></TD>
                  <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{m.duration || '—'}</TD>
                  <TD style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 13 }}>{fmtCurrency(m.price)}</TD>
                  <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{fmtDate(m.startDate)}</TD>
                  <TD style={{ color: daysLeft != null && daysLeft <= 7 ? 'var(--red, #ef4444)' : 'var(--text-2)', fontSize: 12 }}>
                    {fmtDate(m.endDate)}
                  </TD>
                  <TD>
                    {daysLeft != null ? (
                      <span style={{
                        fontWeight: 700, fontSize: 13,
                        color: daysLeft <= 3 ? 'var(--red, #ef4444)' : daysLeft <= 7 ? 'var(--amber, #f59e0b)' : 'var(--green, #22c55e)',
                      }}>
                        {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
                      </span>
                    ) : '—'}
                  </TD>
                  <TD><StatusBadge status={m.status} /></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <ActionBtn onClick={() => handleExtend(m._id, 30)} variant="success" style={{ padding: '3px 8px' }}>+30d</ActionBtn>
                      {m.status === 'active' && (
                        <ActionBtn onClick={() => handleCancel(m._id)} variant="danger" style={{ padding: '3px 8px' }}>Cancel</ActionBtn>
                      )}
                    </div>
                  </TD>
                </TR>
              );
            })}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={total} limit={50} onPage={setPage} />
      </TableCard>
    </div>
  );
}
