import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiDownload, FiClock } from 'react-icons/fi';
import {
  apiFetch, exportCSV, fmtDate, daysSince, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, ActionBtn, EmptyState, LoadingSkeleton,
  Modal, Pagination,
} from './shared';

const MEMBERSHIP_OPTS = [
  { value: 'Basic', label: 'Basic' }, { value: 'Pro', label: 'Pro' },
  { value: 'Premium', label: 'Premium' }, { value: 'None', label: 'Free' },
];
const DORMANT_OPTS = [
  { value: '14', label: '14 days' }, { value: '30', label: '30 days' },
  { value: '60', label: '60 days' }, { value: '90', label: '90 days' },
];

export default function UserLifecycle() {
  const [segment, setSegment] = useState('all');
  const [lifecycle, setLifecycle] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [dormantDays, setDormantDays] = useState('30');

  const [timelineModal, setTimelineModal] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const loadLifecycle = useCallback(async () => {
    try {
      const r = await apiFetch('/users/lifecycle');
      setLifecycle(r.data);
    } catch {}
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (segment === 'dormant') {
        const params = new URLSearchParams({ days: dormantDays, page, limit: 50 });
        if (membershipFilter) params.set('membership', membershipFilter);
        const r = await apiFetch(`/users/dormant?${params}`);
        setUsers(r.data || []);
        setTotal(r.total || 0);
      } else {
        const params = new URLSearchParams({ page, limit: 50 });
        if (search) params.set('search', search);
        if (membershipFilter) params.set('membership', membershipFilter);
        const r = await apiFetch(`/users?${params}`);
        setUsers(r.data || []);
        setTotal(r.total || 0);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [segment, page, search, membershipFilter, dormantDays]);

  useEffect(() => { loadLifecycle(); }, [loadLifecycle]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openTimeline = async (user) => {
    setTimelineModal(user);
    setTimelineLoading(true);
    setTimelineData(null);
    try {
      const r = await apiFetch(`/users/${user._id}/timeline`);
      setTimelineData(r.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTimelineLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(`User ${status.toLowerCase()}`);
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pages = Math.ceil(total / 50);

  const SEGMENTS = [
    { id: 'all', label: 'All Users', count: null },
    { id: 'dormant', label: 'Dormant', count: lifecycle?.dormant30 },
  ];

  return (
    <div>
      <ModuleHeader
        title="User Lifecycle Management"
        description="Track members from registration through activation, dormancy, and churn"
        action={
          <ActionBtn variant="export" onClick={() => exportCSV(`/exports/users${membershipFilter ? `?membership=${membershipFilter}` : ''}`, 'users.csv')}>
            <FiDownload size={13} /> Export CSV
          </ActionBtn>
        }
      />

      {/* Lifecycle KPIs */}
      {lifecycle && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <KPICard label="New (7 days)" value={lifecycle.newUsers} color="var(--accent)" />
          <KPICard label="Active Members" value={lifecycle.activeUsers} color="var(--green, #22c55e)" sub="Logged in last 30 days" />
          <KPICard label="Dormant (30-60d)" value={lifecycle.dormant30} color="var(--amber, #f59e0b)" />
          <KPICard label="Dormant (60-90d)" value={lifecycle.dormant60} color="var(--orange, #f97316)" />
          <KPICard label="Churned (90d+)" value={lifecycle.dormant90} color="var(--red, #ef4444)" />
          <KPICard label="Never Logged In" value={lifecycle.neverLoggedIn} color="var(--text-3)" />
          <KPICard label="Onboarding Done" value={lifecycle.completedOnboarding} />
        </div>
      )}

      {/* Segment tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SEGMENTS.map(s => (
          <button key={s.id} onClick={() => { setSegment(s.id); setPage(1); }}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-1)', cursor: 'pointer', fontWeight: 600, fontSize: 12,
              background: segment === s.id ? 'var(--accent)' : 'var(--surface-2)',
              color: segment === s.id ? '#fff' : 'var(--text-2)',
            }}>
            {s.label}{s.count != null ? ` (${s.count})` : ''}
          </button>
        ))}
        {segment === 'dormant' && (
          <SelectFilter value={dormantDays} onChange={v => { setDormantDays(v); setPage(1); }} options={DORMANT_OPTS} placeholder="Inactive for" />
        )}
      </div>

      {/* Filters */}
      <FilterBar>
        {segment === 'all' && <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." />}
        <SelectFilter value={membershipFilter} onChange={v => { setMembershipFilter(v); setPage(1); }} options={MEMBERSHIP_OPTS} placeholder="All Plans" />
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : users.length === 0 ? (
          <EmptyState icon={FiUsers} title="No users in this segment" sub="Adjust filters or check a different segment" />
        ) : (
          <Table heads={['Member', 'Role', 'Membership', 'Status', 'Last Login', 'Streak', 'Points', 'Joined', 'Actions']}>
            {users.map(u => {
              const inactive = daysSince(u.lastLogin);
              return (
                <TR key={u._id}>
                  <TD>
                    <div>
                      <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{u.email}</div>
                    </div>
                  </TD>
                  <TD><StatusBadge status="default" label={u.role} /></TD>
                  <TD><StatusBadge status={u.membership?.toLowerCase() || 'none'} label={u.membership || 'Free'} /></TD>
                  <TD><StatusBadge status={u.status?.toLowerCase() || 'active'} label={u.status || 'Active'} /></TD>
                  <TD>
                    <div>
                      <div style={{ color: inactive && inactive > 30 ? 'var(--amber, #f59e0b)' : 'var(--text-2)', fontSize: 12 }}>
                        {u.lastLogin ? fmtDate(u.lastLogin) : 'Never'}
                      </div>
                      {inactive != null && <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{inactive}d ago</div>}
                    </div>
                  </TD>
                  <TD style={{ color: 'var(--text-2)' }}>{u.currentStreak || 0} days</TD>
                  <TD style={{ color: 'var(--text-2)' }}>{(u.points || 0).toLocaleString()}</TD>
                  <TD style={{ color: 'var(--text-2)' }}>{fmtDate(u.createdAt)}</TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn onClick={() => openTimeline(u)} style={{ padding: '4px 10px' }}>
                        <FiClock size={11} /> Timeline
                      </ActionBtn>
                      {u.status === 'Suspended' ? (
                        <ActionBtn onClick={() => updateStatus(u._id, 'Active')} variant="success" style={{ padding: '4px 10px' }}>Activate</ActionBtn>
                      ) : (
                        <ActionBtn onClick={() => updateStatus(u._id, 'Suspended')} variant="danger" style={{ padding: '4px 10px' }}>Suspend</ActionBtn>
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

      {/* Timeline Modal */}
      <Modal open={!!timelineModal} onClose={() => { setTimelineModal(null); setTimelineData(null); }} title={`Timeline: ${timelineModal?.name}`}>
        {timelineLoading ? <LoadingSkeleton rows={6} height={44} /> : !timelineData ? null : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Orders */}
            <Section title={`Orders (${timelineData.orders.length})`}>
              {timelineData.orders.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>No orders</p> : (
                timelineData.orders.map(o => (
                  <TimelineItem key={o._id}
                    label={`Order #${String(o._id).slice(-6)}`}
                    sub={`₹${o.totalAmount} · ${o.paymentStatus}`}
                    date={o.orderDate} />
                ))
              )}
            </Section>

            {/* Memberships */}
            <Section title={`Memberships (${timelineData.memberships.length})`}>
              {timelineData.memberships.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>No memberships</p> : (
                timelineData.memberships.map(m => (
                  <TimelineItem key={m._id}
                    label={`${m.plan} — ${m.duration}`}
                    sub={`₹${m.price} · ${m.status}`}
                    date={m.createdAt} />
                ))
              )}
            </Section>

            {/* Trainer Bookings */}
            <Section title={`Trainer Sessions (${timelineData.bookings.length})`}>
              {timelineData.bookings.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>No bookings</p> : (
                timelineData.bookings.map(b => (
                  <TimelineItem key={b._id}
                    label={`${b.sessionType?.replace('_', ' ')} — ${b.date}`}
                    sub={`${b.status}${b.memberRating ? ` · ${b.memberRating}★` : ''}`}
                    date={b.createdAt} />
                ))
              )}
            </Section>

            {/* Attendance */}
            <Section title={`Recent Check-ins (${timelineData.attendance.length})`}>
              {timelineData.attendance.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0 }}>No attendance</p> : (
                timelineData.attendance.map(a => (
                  <TimelineItem key={a._id}
                    label={`Check-in · ${a.method || 'app'}`}
                    sub={`${a.duration ? `${a.duration} min` : ''} · +${a.pointsEarned || 0} pts`}
                    date={a.checkInTime} />
                ))
              )}
            </Section>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', color: 'var(--text-2)', fontWeight: 700, fontSize: 13 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  );
}

function TimelineItem({ label, sub, date }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--surface-3)', borderRadius: 8 }}>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)' }}>{sub}</p>}
      </div>
      <span style={{ color: 'var(--text-3)', fontSize: 11, flexShrink: 0, marginLeft: 12 }}>
        {date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
      </span>
    </div>
  );
}
