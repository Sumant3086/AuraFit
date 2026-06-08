import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiCalendar } from 'react-icons/fi';
import {
  apiFetch, fmtDate, fmtCurrency, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SelectFilter, DateInput, ActionBtn, EmptyState, LoadingSkeleton,
  Pagination,
} from './shared';

const STATUS_OPTS = [
  { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];
const TYPE_OPTS = [
  { value: 'personal_training', label: 'Personal Training' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'nutrition_consultation', label: 'Nutrition' },
  { value: 'group_session', label: 'Group Session' },
];

export default function TrainerOps() {
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  const [trainerFilter, setTrainerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const loadOverview = useCallback(async () => {
    try {
      const r = await apiFetch('/trainer-ops/overview');
      setOverview(r.data);
    } catch (err) { toast.error(err.message); }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (trainerFilter) params.set('trainerId', trainerFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const r = await apiFetch(`/trainer-ops/bookings?${params}`);
      setBookings(r.data || []);
      setTotal(r.total || 0);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [page, trainerFilter, statusFilter, from, to]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (activeView === 'bookings') loadBookings(); }, [loadBookings, activeView]);

  const updateBooking = async (id, updates) => {
    try {
      await apiFetch(`/trainer-ops/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
      toast.success('Booking updated');
      loadBookings();
    } catch (err) { toast.error(err.message); }
  };

  const trainers = overview?.trainers || [];
  const byType = overview?.bookingsByType || [];
  const byStatus = overview?.bookingsByStatus || [];
  const topTrainers = overview?.topTrainers || [];
  const recentBookings = overview?.recentBookings || [];
  const pages = Math.ceil(total / 50);

  const completedSessions = byStatus.find(s => s._id === 'completed')?.count || 0;
  const pendingSessions = byStatus.find(s => s._id === 'pending')?.count || 0;
  const totalRevenue = byType.reduce((s, t) => s + (t.revenue || 0), 0);

  return (
    <div>
      <ModuleHeader title="Trainer Operations" description="Session bookings, trainer performance, and revenue tracking" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Total Trainers" value={trainers.length} />
        <KPICard label="Completed Sessions" value={completedSessions} color="var(--green, #22c55e)" />
        <KPICard label="Pending Sessions" value={pendingSessions} color="var(--amber, #f59e0b)" />
        <KPICard label="Session Revenue" value={fmtCurrency(totalRevenue)} color="var(--accent)" />
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'overview', label: 'Overview' }, { id: 'trainers', label: `Trainers (${trainers.length})` }, { id: 'bookings', label: 'All Bookings' }].map(v => (
          <button key={v.id} onClick={() => { setActiveView(v.id); }}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-1)', cursor: 'pointer', fontWeight: 600, fontSize: 12,
              background: activeView === v.id ? 'var(--accent)' : 'var(--surface-2)', color: activeView === v.id ? '#fff' : 'var(--text-2)' }}>
            {v.label}
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Session Types */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 18 }}>
            <p style={{ margin: '0 0 14px', color: 'var(--text-1)', fontWeight: 700, fontSize: 14 }}>Sessions by Type</p>
            {byType.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No sessions yet</p> : byType.map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{(t._id || '').replace('_', ' ')}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{t.count}</span>
                  {t.revenue > 0 && <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 8 }}>{fmtCurrency(t.revenue)}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Top Performers */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 18 }}>
            <p style={{ margin: '0 0 14px', color: 'var(--text-1)', fontWeight: 700, fontSize: 14 }}>Top Trainers by Sessions</p>
            {topTrainers.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No data yet</p> : topTrainers.map((t, i) => (
              <div key={String(t._id)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>#{i + 1}</span>
                <span style={{ color: 'var(--text-1)', fontSize: 13, flex: 1, marginLeft: 8 }}>{t.sessions} sessions</span>
                {t.revenue > 0 && <span style={{ color: 'var(--green, #22c55e)', fontWeight: 600, fontSize: 13 }}>{fmtCurrency(t.revenue)}</span>}
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 18, gridColumn: '1 / -1' }}>
            <p style={{ margin: '0 0 14px', color: 'var(--text-1)', fontWeight: 700, fontSize: 14 }}>Recent Bookings</p>
            {recentBookings.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No recent bookings</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recentBookings.slice(0, 8).map(b => (
                  <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'var(--surface-3)', borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-1)', fontSize: 12, fontWeight: 600 }}>{b.memberId?.name || 'Member'}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 8 }}>with {b.trainerId?.name || 'Trainer'}</span>
                    </div>
                    <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{b.date}</span>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'trainers' && (
        <TableCard>
          {trainers.length === 0 ? (
            <EmptyState icon={FiUser} title="No trainers registered" sub="Trainers appear when assigned the trainer role" />
          ) : (
            <Table heads={['Trainer', 'Specialization', 'Rating', 'Reviews', 'Status']}>
              {trainers.map(t => (
                <TR key={t._id}>
                  <TD>
                    <div>
                      <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{t.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{t.email}</div>
                    </div>
                  </TD>
                  <TD style={{ color: 'var(--text-2)' }}>{t.specialization || '—'}</TD>
                  <TD style={{ color: 'var(--amber, #f59e0b)', fontWeight: 700 }}>
                    {t.totalRatings > 0 ? `${(t.rating || 0).toFixed(1)}★` : '—'}
                  </TD>
                  <TD style={{ color: 'var(--text-2)' }}>{t.totalRatings || 0}</TD>
                  <TD><StatusBadge status={t.status?.toLowerCase() || 'active'} label={t.status || 'Active'} /></TD>
                </TR>
              ))}
            </Table>
          )}
        </TableCard>
      )}

      {activeView === 'bookings' && (
        <>
          <FilterBar>
            <SelectFilter value={trainerFilter} onChange={v => { setTrainerFilter(v); setPage(1); }}
              options={trainers.map(t => ({ value: t._id, label: t.name }))} placeholder="All Trainers" />
            <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTS} placeholder="All Statuses" />
            <DateInput value={from} onChange={setFrom} label="From" />
            <DateInput value={to} onChange={setTo} label="To" />
            <ActionBtn onClick={loadBookings} variant="primary">Filter</ActionBtn>
          </FilterBar>
          <TableCard>
            {loading ? <LoadingSkeleton /> : bookings.length === 0 ? (
              <EmptyState icon={FiCalendar} title="No bookings found" />
            ) : (
              <Table heads={['Member', 'Trainer', 'Date', 'Type', 'Duration', 'Status', 'Rating', 'Amount', 'Actions']}>
                {bookings.map(b => (
                  <TR key={b._id}>
                    <TD>
                      <div style={{ color: 'var(--text-1)', fontWeight: 500, fontSize: 12 }}>{b.memberId?.name || '—'}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{b.memberId?.email || ''}</div>
                    </TD>
                    <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{b.trainerId?.name || '—'}</TD>
                    <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{b.date} {b.startTime}</TD>
                    <TD style={{ fontSize: 11 }}><StatusBadge status="default" label={(b.sessionType || '').replace('_', ' ')} /></TD>
                    <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{b.duration} min</TD>
                    <TD><StatusBadge status={b.status} /></TD>
                    <TD style={{ color: 'var(--amber, #f59e0b)', fontSize: 12 }}>{b.memberRating ? `${b.memberRating}★` : '—'}</TD>
                    <TD style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 12 }}>{b.amount > 0 ? fmtCurrency(b.amount) : '—'}</TD>
                    <TD>
                      {b.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <ActionBtn onClick={() => updateBooking(b._id, { status: 'confirmed' })} variant="success" style={{ padding: '3px 8px' }}>Confirm</ActionBtn>
                          <ActionBtn onClick={() => updateBooking(b._id, { status: 'cancelled' })} variant="danger" style={{ padding: '3px 8px' }}>Cancel</ActionBtn>
                        </div>
                      )}
                      {b.status === 'confirmed' && (
                        <ActionBtn onClick={() => updateBooking(b._id, { status: 'completed' })} variant="primary" style={{ padding: '3px 8px' }}>Complete</ActionBtn>
                      )}
                    </TD>
                  </TR>
                ))}
              </Table>
            )}
            <Pagination page={page} pages={pages} total={total} limit={50} onPage={setPage} />
          </TableCard>
        </>
      )}
    </div>
  );
}
