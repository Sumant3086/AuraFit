import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { exportCSV, ModuleHeader, KPICard, FilterBar, DateInput, ActionBtn, SelectFilter } from './shared';

const REPORTS = [
  {
    id: 'memberships',
    title: 'Membership Report',
    description: 'All memberships with plan, status, payment, and date range',
    endpoint: (f) => `/exports/memberships${f.status ? `?status=${f.status}` : ''}${f.plan ? `${f.status ? '&' : '?'}plan=${f.plan}` : ''}${f.from ? `${(f.status || f.plan) ? '&' : '?'}from=${f.from}` : ''}${f.to ? `&to=${f.to}` : ''}`,
    filename: 'memberships.csv',
    filters: ['status', 'plan', 'dateRange'],
  },
  {
    id: 'users',
    title: 'User Export',
    description: 'Complete user roster with roles, membership, status, and activity',
    endpoint: (f) => `/exports/users${f.membership ? `?membership=${f.membership}` : ''}${f.role ? `${f.membership ? '&' : '?'}role=${f.role}` : ''}`,
    filename: 'users.csv',
    filters: ['membership', 'role'],
  },
  {
    id: 'orders',
    title: 'Orders / Revenue Report',
    description: 'All orders with payment status, amounts, and customer details',
    endpoint: (f) => `/exports/orders${f.paymentStatus ? `?paymentStatus=${f.paymentStatus}` : ''}${f.from ? `${f.paymentStatus ? '&' : '?'}from=${f.from}` : ''}${f.to ? `&to=${f.to}` : ''}`,
    filename: 'orders.csv',
    filters: ['paymentStatus', 'dateRange'],
  },
  {
    id: 'attendance',
    title: 'Attendance Report',
    description: 'Member check-in history with duration, method, and points',
    endpoint: (f) => `/exports/attendance${f.from ? `?from=${f.from}` : ''}${f.to ? `${f.from ? '&' : '?'}to=${f.to}` : ''}`,
    filename: 'attendance.csv',
    filters: ['dateRange'],
  },
];

const MEMBERSHIP_OPTS = [
  { value: 'Basic', label: 'Basic' }, { value: 'Pro', label: 'Pro' },
  { value: 'Premium', label: 'Premium' }, { value: 'None', label: 'Free' },
];
const ROLE_OPTS = [
  { value: 'member', label: 'Member' }, { value: 'trainer', label: 'Trainer' },
  { value: 'gym_admin', label: 'Gym Admin' }, { value: 'user', label: 'User' },
];
const PAYMENT_STATUS_OPTS = [
  { value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' }, { value: 'Refunded', label: 'Refunded' },
];
const MEMBERSHIP_STATUS_OPTS = [
  { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' }, { value: 'cancelled', label: 'Cancelled' },
];
const PLAN_OPTS = [
  { value: 'basic', label: 'Basic' }, { value: 'pro', label: 'Pro' },
  { value: 'premium', label: 'Premium' }, { value: 'trial', label: 'Trial' },
];

export default function ReportingExports() {
  const [loading, setLoading] = useState({});
  const [filters, setFilters] = useState({
    from: '', to: '', status: '', paymentStatus: '', membership: '', role: '', plan: '',
  });

  const setFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }));

  const handleExport = async (report) => {
    setLoading(p => ({ ...p, [report.id]: true }));
    try {
      await exportCSV(report.endpoint(filters), report.filename);
      toast.success(`${report.title} downloaded`);
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setLoading(p => ({ ...p, [report.id]: false }));
    }
  };

  return (
    <div>
      <ModuleHeader title="Reporting & Exports" description="Download CSV reports for memberships, users, revenue, and attendance" />

      {/* Global date filter */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ margin: '0 0 12px', color: 'var(--text-2)', fontWeight: 600, fontSize: 13 }}>Global Date Range (applies to date-filtered reports)</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600 }}>FROM</label>
            <DateInput value={filters.from} onChange={v => setFilter('from', v)} label="From date" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600 }}>TO</label>
            <DateInput value={filters.to} onChange={v => setFilter('to', v)} label="To date" />
          </div>
          <ActionBtn onClick={() => setFilters(p => ({ ...p, from: '', to: '' }))}>Clear Dates</ActionBtn>
        </div>
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {REPORTS.map(report => (
          <div key={report.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ margin: '0 0 4px', color: 'var(--text-1)', fontWeight: 700, fontSize: 15 }}>{report.title}</p>
                <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 12, lineHeight: 1.5 }}>{report.description}</p>
              </div>
              <FiFileText size={18} style={{ color: 'var(--text-3)', flexShrink: 0, marginLeft: 10 }} />
            </div>

            {/* Per-report filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {report.filters.includes('status') && (
                <SelectFilter value={filters.status} onChange={v => setFilter('status', v)}
                  options={MEMBERSHIP_STATUS_OPTS} placeholder="All Statuses" />
              )}
              {report.filters.includes('plan') && (
                <SelectFilter value={filters.plan} onChange={v => setFilter('plan', v)}
                  options={PLAN_OPTS} placeholder="All Plans" />
              )}
              {report.filters.includes('membership') && (
                <SelectFilter value={filters.membership} onChange={v => setFilter('membership', v)}
                  options={MEMBERSHIP_OPTS} placeholder="All Memberships" />
              )}
              {report.filters.includes('role') && (
                <SelectFilter value={filters.role} onChange={v => setFilter('role', v)}
                  options={ROLE_OPTS} placeholder="All Roles" />
              )}
              {report.filters.includes('paymentStatus') && (
                <SelectFilter value={filters.paymentStatus} onChange={v => setFilter('paymentStatus', v)}
                  options={PAYMENT_STATUS_OPTS} placeholder="All Payment Statuses" />
              )}
            </div>

            <ActionBtn
              onClick={() => handleExport(report)}
              variant="export"
              disabled={loading[report.id]}
              style={{ width: '100%', justifyContent: 'center', padding: '9px 14px' }}
            >
              <FiDownload size={13} />
              {loading[report.id] ? 'Generating...' : `Download ${report.filename}`}
            </ActionBtn>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 10 }}>
        <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 12 }}>
          All exports are in CSV format and reflect live database data at the time of download. Date filters apply where indicated. Reports without date filters will include all records matching the selected filters.
        </p>
      </div>
    </div>
  );
}
