import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiCreditCard, FiAlertCircle, FiDownload } from 'react-icons/fi';
import {
  apiFetch, exportCSV, fmtCurrency, fmtDate, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, DateInput, ActionBtn, EmptyState,
  LoadingSkeleton, Modal, Pagination,
} from './shared';

const PLAN_OPTS = [
  { value: 'basic', label: 'Basic' }, { value: 'pro', label: 'Pro' },
  { value: 'premium', label: 'Premium' }, { value: 'trial', label: 'Trial' },
];
const STATUS_OPTS = [
  { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' }, { value: 'cancelled', label: 'Cancelled' },
];

export default function MembershipOps() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [expiringDays, setExpiringDays] = useState(30);

  const [extendModal, setExtendModal] = useState(null);
  const [extendDays, setExtendDays] = useState(30);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState('all'); // all | expiring

  const loadStats = useCallback(async () => {
    try {
      const r = await apiFetch('/memberships/stats');
      setStats(r.data);
    } catch {}
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeView === 'expiring') {
        const r = await apiFetch(`/memberships/expiring?days=${expiringDays}`);
        setData(r.data || []);
        setTotal(r.count || 0);
        setPages(1);
      } else {
        const params = new URLSearchParams({ page, limit: 50 });
        if (search) params.set('search', search);
        if (planFilter) params.set('plan', planFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (paymentFilter) params.set('paymentStatus', paymentFilter);
        const r = await apiFetch(`/memberships/full?${params}`);
        setData(r.data || []);
        setTotal(r.total || 0);
        setPages(r.pages || 1);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeView, page, search, planFilter, statusFilter, paymentFilter, expiringDays]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadData(); }, [loadData]);

  const handleExtend = async () => {
    if (!extendModal || !extendDays) return;
    setActionLoading(true);
    try {
      await apiFetch(`/memberships/${extendModal._id}/extend`, {
        method: 'PATCH', body: JSON.stringify({ days: parseInt(extendDays) }),
      });
      toast.success(`Extended by ${extendDays} days`);
      setExtendModal(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this membership?')) return;
    try {
      await apiFetch(`/memberships/${id}/cancel`, { method: 'PATCH' });
      toast.success('Membership cancelled');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const byPlan = stats?.byPlan || [];
  const byStatus = stats?.byStatus || [];

  return (
    <div>
      <ModuleHeader
        title="Membership Operations"
        description="Full lifecycle management — active, pending, expiring, and cancelled memberships"
        action={
          <ActionBtn variant="export" onClick={() => exportCSV(`/exports/memberships${statusFilter ? `?status=${statusFilter}` : ''}`, 'memberships.csv')}>
            <FiDownload size={13} /> Export CSV
          </ActionBtn>
        }
      />

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Total Revenue" value={fmtCurrency(stats?.totalRevenue)} sub="All paid memberships" color="var(--green, #22c55e)" />
        <KPICard label="Active Plans" value={byStatus.find(s => s._id === 'active')?.count ?? '—'} sub="Currently active" />
        <KPICard label="Pending Approval" value={byStatus.find(s => s._id === 'pending')?.count ?? '—'} sub="Awaiting approval" color="var(--amber, #f59e0b)" />
        <KPICard label="Expired" value={byStatus.find(s => s._id === 'expired')?.count ?? '—'} sub="Needs renewal" color="var(--red, #ef4444)" />
        {byPlan.map(p => (
          <KPICard key={p._id} label={`${p._id} Plan`} value={p.count} sub={fmtCurrency(p.revenue)} />
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'all', label: 'All Memberships' },
          { id: 'expiring', label: `Expiring Soon` },
        ].map(v => (
          <button key={v.id} onClick={() => { setActiveView(v.id); setPage(1); }}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-1)', cursor: 'pointer', fontWeight: 600, fontSize: 12,
              background: activeView === v.id ? 'var(--accent)' : 'var(--surface-2)',
              color: activeView === v.id ? '#fff' : 'var(--text-2)',
            }}>
            {v.label}
          </button>
        ))}
        {activeView === 'expiring' && (
          <SelectFilter value={String(expiringDays)} onChange={v => setExpiringDays(Number(v))} placeholder="Window"
            options={[{ value: '7', label: '7 days' }, { value: '14', label: '14 days' }, { value: '30', label: '30 days' }]} />
        )}
      </div>

      {/* Filters */}
      {activeView === 'all' && (
        <FilterBar>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." />
          <SelectFilter value={planFilter} onChange={v => { setPlanFilter(v); setPage(1); }} options={PLAN_OPTS} placeholder="All Plans" />
          <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTS} placeholder="All Statuses" />
          <SelectFilter value={paymentFilter} onChange={v => { setPaymentFilter(v); setPage(1); }}
            options={[{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }]}
            placeholder="Payment: All" />
        </FilterBar>
      )}

      {/* Table */}
      {activeView === 'expiring' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10 }}>
          <FiAlertCircle size={14} color="var(--amber, #f59e0b)" />
          <span style={{ color: 'var(--amber, #f59e0b)', fontSize: 13, fontWeight: 600 }}>{total} memberships expiring within {expiringDays} days</span>
        </div>
      )}

      <TableCard>
        {loading ? <LoadingSkeleton /> : data.length === 0 ? (
          <EmptyState icon={FiCreditCard} title="No memberships found" sub="Adjust your filters or check back later" />
        ) : (
          <Table heads={['Member', 'Plan', 'Duration', 'Price', 'Status', 'Payment', 'Start', 'End', 'Actions']}>
            {data.map(m => (
              <TR key={m._id}>
                <TD>
                  <div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{m.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{m.email}</div>
                  </div>
                </TD>
                <TD><StatusBadge status={m.plan} label={m.plan} /></TD>
                <TD style={{ color: 'var(--text-2)' }}>{m.duration || '—'}</TD>
                <TD style={{ color: 'var(--text-1)', fontWeight: 600 }}>{fmtCurrency(m.price)}</TD>
                <TD><StatusBadge status={m.status} /></TD>
                <TD><StatusBadge status={m.paymentStatus} /></TD>
                <TD style={{ color: 'var(--text-2)' }}>{fmtDate(m.startDate)}</TD>
                <TD style={{ color: m.endDate && new Date(m.endDate) < new Date(Date.now() + 7 * 86400000) ? 'var(--red, #ef4444)' : 'var(--text-2)' }}>
                  {fmtDate(m.endDate)}
                </TD>
                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn onClick={() => setExtendModal(m)} variant="success" style={{ padding: '4px 10px' }}>Extend</ActionBtn>
                    {m.status !== 'cancelled' && (
                      <ActionBtn onClick={() => handleCancel(m._id)} variant="danger" style={{ padding: '4px 10px' }}>Cancel</ActionBtn>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        )}
        {activeView === 'all' && (
          <Pagination page={page} pages={pages} total={total} limit={50} onPage={setPage} />
        )}
      </TableCard>

      {/* Extend Modal */}
      <Modal open={!!extendModal} onClose={() => setExtendModal(null)} title="Extend Membership">
        {extendModal && (
          <div>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 16 }}>
              Extending membership for <strong style={{ color: 'var(--text-1)' }}>{extendModal.name}</strong>
              <br /><span style={{ color: 'var(--text-3)' }}>Current end: {fmtDate(extendModal.endDate)}</span>
            </p>
            <label style={{ color: 'var(--text-2)', fontSize: 13, display: 'block', marginBottom: 8 }}>Extend by (days)</label>
            <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)} min={1} max={365}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 14, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <ActionBtn onClick={() => setExtendModal(null)}>Cancel</ActionBtn>
              <ActionBtn onClick={handleExtend} variant="primary" disabled={actionLoading}>
                {actionLoading ? 'Extending...' : `Extend ${extendDays} days`}
              </ActionBtn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
