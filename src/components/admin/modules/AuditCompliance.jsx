import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiShield, FiDownload } from 'react-icons/fi';
import {
  apiFetch, fmtDateTime, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, DateInput, ActionBtn, EmptyState,
  LoadingSkeleton, Pagination,
} from './shared';

const RESOURCE_OPTS = [
  { value: 'User', label: 'User' }, { value: 'Membership', label: 'Membership' },
  { value: 'Order', label: 'Order' }, { value: 'Class', label: 'Class' },
  { value: 'Gym', label: 'Gym' },
];

const exportAuditCSV = (logs) => {
  if (!logs.length) return;
  const headers = ['Timestamp', 'Admin', 'Action', 'Resource', 'Resource ID', 'Status'];
  const rows = logs.map(l => [
    fmtDateTime(l.createdAt),
    l.adminEmail,
    l.action,
    l.resource,
    l.resourceId || '',
    l.status,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'audit-logs.csv'; a.click();
  URL.revokeObjectURL(url);
};

export default function AuditCompliance() {
  const [logs, setLogs] = useState([]);
  const [byAction, setByAction] = useState([]);
  const [byResource, setByResource] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [actionSearch, setActionSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 100 });
      if (actionSearch) params.set('action', actionSearch);
      if (resourceFilter) params.set('resource', resourceFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const r = await apiFetch(`/audit-logs?${params}`);
      setLogs(r.data || []);
      setTotal(r.total || 0);
      setByAction(r.byAction || []);
      setByResource(r.byResource || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [page, actionSearch, resourceFilter, statusFilter, from, to]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / 100);
  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div>
      <ModuleHeader
        title="Audit & Compliance Logs"
        description="Immutable admin action log — 1-year retention policy"
        action={
          <ActionBtn variant="export" onClick={() => exportAuditCSV(logs)}>
            <FiDownload size={13} /> Export Page
          </ActionBtn>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Total Logs" value={total.toLocaleString()} />
        <KPICard label="Failed Actions" value={failedCount} color="var(--red, #ef4444)" sub="In current view" />
        {byResource.slice(0, 4).map(r => (
          <KPICard key={r._id} label={r._id} value={r.count} />
        ))}
      </div>

      {/* Top Actions */}
      {byAction.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: '0 0 10px', color: 'var(--text-2)', fontWeight: 600, fontSize: 12 }}>Most Common Actions</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {byAction.map(a => (
              <div key={a._id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <code style={{ color: 'var(--accent)', fontSize: 11 }}>{a._id}</code>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>×{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <FilterBar>
        <SearchInput value={actionSearch} onChange={v => { setActionSearch(v); setPage(1); }} placeholder="Filter by action..." />
        <SelectFilter value={resourceFilter} onChange={v => { setResourceFilter(v); setPage(1); }} options={RESOURCE_OPTS} placeholder="All Resources" />
        <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }}
          options={[{ value: 'success', label: 'Success' }, { value: 'failed', label: 'Failed' }]} placeholder="All Statuses" />
        <DateInput value={from} onChange={setFrom} label="From" />
        <DateInput value={to} onChange={setTo} label="To" />
        <ActionBtn onClick={load} variant="primary">Filter</ActionBtn>
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton rows={10} height={44} /> : logs.length === 0 ? (
          <EmptyState icon={FiShield} title="No audit logs found" sub="Admin actions are automatically logged here" />
        ) : (
          <Table heads={['Status', 'Action', 'Resource', 'Resource ID', 'Admin', 'IP', 'Timestamp']}>
            {logs.map((l, i) => (
              <TR key={l._id || i}>
                <TD>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.status === 'failed' ? 'var(--red, #ef4444)' : 'var(--green, #22c55e)' }} />
                </TD>
                <TD>
                  <code style={{ color: 'var(--accent)', fontSize: 11, background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4 }}>
                    {l.action}
                  </code>
                </TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{l.resource}</TD>
                <TD>
                  {l.resourceId && (
                    <code style={{ color: 'var(--text-3)', fontSize: 10 }}>{String(l.resourceId).slice(-10)}</code>
                  )}
                </TD>
                <TD>
                  <div>
                    <div style={{ color: 'var(--text-1)', fontSize: 12 }}>{l.adminName}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{l.adminEmail}</div>
                  </div>
                </TD>
                <TD style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'monospace' }}>{l.ip || '—'}</TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDateTime(l.createdAt)}</TD>
              </TR>
            ))}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={total} limit={100} onPage={setPage} />
      </TableCard>

      {/* Compliance note */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 10 }}>
        <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 12 }}>
          Audit logs are immutable and automatically expire after 365 days per the platform retention policy. All admin actions including role changes, status updates, and data modifications are captured.
        </p>
      </div>
    </div>
  );
}
