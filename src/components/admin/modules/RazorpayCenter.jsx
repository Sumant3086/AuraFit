import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiCreditCard, FiDownload, FiRefreshCw } from 'react-icons/fi';
import {
  apiFetch, exportCSV, fmtCurrency, fmtDate, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, DateInput, ActionBtn, EmptyState,
  LoadingSkeleton, Pagination,
} from './shared';

const PAYMENT_STATUS_OPTS = [
  { value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' }, { value: 'Refunded', label: 'Refunded' },
];
const METHOD_OPTS = [
  { value: 'Razorpay', label: 'Razorpay' }, { value: 'UPI', label: 'UPI' },
  { value: 'Card', label: 'Card' }, { value: 'Net Banking', label: 'Net Banking' },
  { value: 'Cash', label: 'Cash' },
];

export default function RazorpayCenter() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [byStatus, setByStatus] = useState([]);
  const [byMethod, setByMethod] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (statusFilter) params.set('status', statusFilter);
      if (methodFilter) params.set('method', methodFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const r = await apiFetch(`/payments/overview?${params}`);
      setData(r.data || []);
      setTotal(r.total || 0);
      setByStatus(r.byStatus || []);
      setByMethod(r.byMethod || []);
      setSummary(r.summary || {});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, methodFilter, from, to]);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async (id, orderNo) => {
    if (!window.confirm(`Mark order #${orderNo} as refunded?`)) return;
    try {
      await apiFetch(`/payments/${id}/refund`, { method: 'PATCH' });
      toast.success('Marked as refunded');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pages = Math.ceil(total / 50);

  return (
    <div>
      <ModuleHeader
        title="Razorpay Operations Center"
        description="All payment transactions, status tracking, refund management"
        action={
          <ActionBtn variant="export" onClick={() => {
            const params = new URLSearchParams();
            if (statusFilter) params.set('paymentStatus', statusFilter);
            if (from) params.set('from', from);
            if (to) params.set('to', to);
            exportCSV(`/exports/orders?${params}`, 'orders.csv');
          }}>
            <FiDownload size={13} /> Export CSV
          </ActionBtn>
        }
      />

      {/* Summary KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Total Collected" value={fmtCurrency(summary.totalPaid)} color="var(--green, #22c55e)" />
        <KPICard label="Pending" value={fmtCurrency(summary.totalPending)} color="var(--amber, #f59e0b)" />
        <KPICard label="Refunded" value={fmtCurrency(summary.totalRefunded)} color="var(--blue, #3b82f6)" />
        <KPICard label="Failed" value={fmtCurrency(summary.totalFailed)} color="var(--red, #ef4444)" />
      </div>

      {/* Payment Method Breakdown */}
      {byMethod.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: '0 0 12px', color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>Revenue by Payment Method</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {byMethod.map(m => (
              <div key={m._id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m._id}</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 16 }}>{fmtCurrency(m.amount)}</span>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{m.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar>
        <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={PAYMENT_STATUS_OPTS} placeholder="All Statuses" />
        <SelectFilter value={methodFilter} onChange={v => { setMethodFilter(v); setPage(1); }} options={METHOD_OPTS} placeholder="All Methods" />
        <DateInput value={from} onChange={v => { setFrom(v); setPage(1); }} label="From" />
        <DateInput value={to} onChange={v => { setTo(v); setPage(1); }} label="To" />
        <ActionBtn onClick={load}><FiRefreshCw size={13} /></ActionBtn>
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : data.length === 0 ? (
          <EmptyState icon={FiCreditCard} title="No transactions found" sub="Adjust filters or date range" />
        ) : (
          <Table heads={['Order ID', 'Customer', 'Items', 'Amount', 'Method', 'Payment Status', 'Order Status', 'Date', 'Actions']}>
            {data.map(o => (
              <TR key={o._id}>
                <TD><code style={{ color: 'var(--accent)', fontSize: 11 }}>#{String(o._id).slice(-8)}</code></TD>
                <TD>
                  <div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{o.userName}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{o.userEmail}</div>
                  </div>
                </TD>
                <TD style={{ color: 'var(--text-2)' }}>{o.items?.length || 0}</TD>
                <TD style={{ color: 'var(--text-1)', fontWeight: 700 }}>{fmtCurrency(o.totalAmount)}</TD>
                <TD><StatusBadge status="default" label={o.paymentMethod || '—'} /></TD>
                <TD><StatusBadge status={o.paymentStatus} /></TD>
                <TD><StatusBadge status={o.status} /></TD>
                <TD style={{ color: 'var(--text-2)' }}>{fmtDate(o.orderDate || o.createdAt)}</TD>
                <TD>
                  {o.paymentStatus === 'Paid' && (
                    <ActionBtn onClick={() => handleRefund(o._id, String(o._id).slice(-8))} variant="danger" style={{ padding: '4px 10px' }}>
                      Refund
                    </ActionBtn>
                  )}
                </TD>
              </TR>
            ))}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={total} limit={50} onPage={setPage} />
      </TableCard>
    </div>
  );
}
