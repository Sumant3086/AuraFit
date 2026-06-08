import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiBell, FiPlus, FiSend } from 'react-icons/fi';
import {
  apiFetch, fmtDateTime, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SelectFilter, ActionBtn, EmptyState, LoadingSkeleton, Modal, Pagination,
} from './shared';

const TYPE_OPTS = [
  { value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' },
  { value: 'promo', label: 'Promo' }, { value: 'event', label: 'Event' },
];

const BLANK = { title: '', content: '', type: 'info', targetRoles: [], pinned: false, expiresAt: '' };

export default function NotificationCenter() {
  const [announcements, setAnnouncements] = useState([]);
  const [notifStats, setNotifStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [sending, setSending] = useState(false);

  const loadStats = useCallback(async () => {
    try { const r = await apiFetch('/notify/stats'); setNotifStats(r.data); } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const r = await apiFetch(`/notify/announcements?${params}`);
      setAnnouncements(r.data || []);
      setTotal(r.total || 0);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { load(); }, [load]);

  const handleBroadcast = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required');
    setSending(true);
    try {
      await apiFetch('/notify/broadcast', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Announcement broadcast to all members');
      setComposeOpen(false);
      setForm(BLANK);
      loadStats();
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const toggleActive = async (id, current) => {
    try {
      await apiFetch(`/notify/announcements/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !current }) });
      toast.success(current ? 'Announcement deactivated' : 'Announcement activated');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const pages = Math.ceil(total / 20);
  const typeColors = { info: 'var(--accent)', warning: 'var(--amber, #f59e0b)', promo: 'var(--green, #22c55e)', event: 'var(--purple, #8b5cf6)' };

  return (
    <div>
      <ModuleHeader
        title="Notification Center"
        description="Platform-wide announcements, broadcasts, and notification management"
        action={
          <ActionBtn variant="primary" onClick={() => setComposeOpen(true)}>
            <FiPlus size={13} /> New Announcement
          </ActionBtn>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Total Notifications" value={(notifStats?.totalNotifications || 0).toLocaleString()} />
        <KPICard label="Unread" value={(notifStats?.unreadNotifications || 0).toLocaleString()} color="var(--amber, #f59e0b)" />
        <KPICard label="Active Announcements" value={total} color="var(--accent)" />
        {(notifStats?.announcementTypes || []).map(t => (
          <KPICard key={t._id} label={`${t._id} type`} value={t.count} color={typeColors[t._id] || 'var(--text-2)'} />
        ))}
      </div>

      <FilterBar>
        <SelectFilter value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} options={TYPE_OPTS} placeholder="All Types" />
        <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }}
          options={[{ value: 'active', label: 'Active Only' }]} placeholder="All" />
        <ActionBtn onClick={load}>Refresh</ActionBtn>
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : announcements.length === 0 ? (
          <EmptyState icon={FiBell} title="No announcements" sub="Broadcast your first announcement to all members" />
        ) : (
          <Table heads={['Title', 'Type', 'Content Preview', 'Pinned', 'Active', 'Expires', 'Created', 'Actions']}>
            {announcements.map(a => (
              <TR key={a._id}>
                <TD style={{ color: 'var(--text-1)', fontWeight: 600, maxWidth: 180 }}>{a.title}</TD>
                <TD><StatusBadge status={a.type || 'info'} label={a.type} /></TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12, maxWidth: 240 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {a.content}
                  </span>
                </TD>
                <TD>{a.pinned ? <span style={{ color: 'var(--amber, #f59e0b)', fontWeight: 700, fontSize: 12 }}>Pinned</span> : '—'}</TD>
                <TD><StatusBadge status={a.isActive ? 'active' : 'cancelled'} label={a.isActive ? 'Active' : 'Inactive'} /></TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>
                  {a.expiresAt ? fmtDateTime(a.expiresAt) : '—'}
                </TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{fmtDateTime(a.createdAt)}</TD>
                <TD>
                  <ActionBtn onClick={() => toggleActive(a._id, a.isActive)} variant={a.isActive ? 'danger' : 'success'} style={{ padding: '4px 10px' }}>
                    {a.isActive ? 'Deactivate' : 'Activate'}
                  </ActionBtn>
                </TD>
              </TR>
            ))}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={total} limit={20} onPage={setPage} />
      </TableCard>

      {/* Compose Modal */}
      <Modal open={composeOpen} onClose={() => { setComposeOpen(false); setForm(BLANK); }} title="New Announcement">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Announcement title..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Content *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4}
              placeholder="Announcement body..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }}>
                {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="pinned" style={{ color: 'var(--text-2)', fontSize: 14, cursor: 'pointer' }}>Pin this announcement</label>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 12, margin: 0, background: 'var(--surface-3)', padding: '8px 12px', borderRadius: 8 }}>
            This announcement will be broadcast to all members as a notification.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <ActionBtn onClick={() => setComposeOpen(false)}>Cancel</ActionBtn>
            <ActionBtn onClick={handleBroadcast} variant="primary" disabled={sending || !form.title || !form.content}>
              <FiSend size={13} /> {sending ? 'Sending...' : 'Broadcast'}
            </ActionBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
