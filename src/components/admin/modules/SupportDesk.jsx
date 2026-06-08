import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiHelpCircle, FiSend } from 'react-icons/fi';
import {
  apiFetch, fmtDate, fmtDateTime, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, ActionBtn, EmptyState, LoadingSkeleton,
  Modal, Pagination,
} from './shared';

const STATUS_OPTS = [
  { value: 'new', label: 'New' }, { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];
const PRIORITY_OPTS = [
  { value: 'urgent', label: 'Urgent' }, { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
];
const CATEGORY_OPTS = [
  { value: 'general', label: 'General' }, { value: 'billing', label: 'Billing' },
  { value: 'membership', label: 'Membership' }, { value: 'technical', label: 'Technical' },
  { value: 'trainer', label: 'Trainer' }, { value: 'complaint', label: 'Complaint' },
  { value: 'feedback', label: 'Feedback' },
];

const priorityColor = (p) => {
  if (p === 'urgent') return 'var(--red, #ef4444)';
  if (p === 'high') return 'var(--orange, #f97316)';
  if (p === 'medium') return 'var(--amber, #f59e0b)';
  return 'var(--text-3)';
};

export default function SupportDesk() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [ticketPriority, setTicketPriority] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const r = await apiFetch(`/support/tickets?${params}`);
      setTickets(r.data || []);
      setTotal(r.total || 0);
      setStats(r.stats || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openTicket = (t) => {
    setSelected(t);
    setResponse(t.response || '');
    setAdminNotes(t.adminNotes || '');
    setAssignedTo(t.assignedTo || '');
    setTicketStatus(t.status || 'new');
    setTicketPriority(t.priority || 'medium');
  };

  const handleUpdate = async (withResponse = false) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updates = { status: ticketStatus, priority: ticketPriority, adminNotes, assignedTo };
      if (withResponse && response) updates.response = response;
      await apiFetch(`/support/tickets/${selected._id}`, { method: 'PATCH', body: JSON.stringify(updates) });
      if (withResponse && response) {
        await apiFetch(`/support/tickets/${selected._id}/respond`, {
          method: 'POST', body: JSON.stringify({ response }),
        });
      }
      toast.success('Ticket updated');
      setSelected(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const pages = Math.ceil(total / 50);
  const newCount = stats.find(s => s._id === 'new')?.count || 0;
  const openCount = stats.find(s => s._id === 'open')?.count || 0;
  const inProgress = stats.find(s => s._id === 'in_progress')?.count || 0;
  const resolved = stats.find(s => s._id === 'resolved')?.count || 0;

  return (
    <div>
      <ModuleHeader title="Support Desk" description="Customer inquiries, complaint management, and resolution tracking" />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="New" value={newCount} color="var(--accent)" sub="Unassigned" />
        <KPICard label="Open" value={openCount} color="var(--amber, #f59e0b)" />
        <KPICard label="In Progress" value={inProgress} color="var(--blue, #3b82f6)" />
        <KPICard label="Resolved" value={resolved} color="var(--green, #22c55e)" />
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, email, message..." />
        <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTS} placeholder="All Statuses" />
        <SelectFilter value={priorityFilter} onChange={v => { setPriorityFilter(v); setPage(1); }} options={PRIORITY_OPTS} placeholder="All Priorities" />
        <SelectFilter value={categoryFilter} onChange={v => { setCategoryFilter(v); setPage(1); }} options={CATEGORY_OPTS} placeholder="All Categories" />
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : tickets.length === 0 ? (
          <EmptyState icon={FiHelpCircle} title="No support tickets" sub="Contact form submissions will appear here" />
        ) : (
          <Table heads={['#', 'Requester', 'Category', 'Subject', 'Priority', 'Status', 'Assigned', 'Created', 'Actions']}>
            {tickets.map((t, i) => (
              <TR key={t._id} onClick={() => openTicket(t)}>
                <TD style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'monospace' }}>#{String(t._id).slice(-6)}</TD>
                <TD>
                  <div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 12 }}>{t.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{t.email}</div>
                  </div>
                </TD>
                <TD><StatusBadge status="default" label={t.category || 'general'} /></TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12, maxWidth: 200 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                    {t.message?.slice(0, 60)}{t.message?.length > 60 ? '...' : ''}
                  </span>
                </TD>
                <TD>
                  <span style={{ color: priorityColor(t.priority), fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }}>
                    {t.priority || 'medium'}
                  </span>
                </TD>
                <TD><StatusBadge status={t.status || 'new'} /></TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{t.assignedTo || '—'}</TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>{fmtDate(t.createdAt)}</TD>
                <TD>
                  <ActionBtn onClick={e => { e.stopPropagation(); openTicket(t); }} style={{ padding: '4px 10px' }}>Open</ActionBtn>
                </TD>
              </TR>
            ))}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={total} limit={50} onPage={setPage} />
      </TableCard>

      {/* Ticket Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Ticket #${selected ? String(selected._id).slice(-6) : ''}`}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Requester */}
            <div style={{ background: 'var(--surface-3)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--text-1)', fontSize: 15 }}>{selected.name}</p>
                  <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 12 }}>{selected.email}</p>
                  {selected.phone && <p style={{ margin: '2px 0 0', color: 'var(--text-3)', fontSize: 11 }}>{selected.phone}</p>}
                </div>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{fmtDateTime(selected.createdAt)}</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <p style={{ margin: '0 0 6px', color: 'var(--text-3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Message</p>
              <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, background: 'var(--surface-3)', padding: '10px 12px', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>
            </div>

            {/* Controls row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Status', value: ticketStatus, onChange: setTicketStatus, options: STATUS_OPTS },
                { label: 'Priority', value: ticketPriority, onChange: setTicketPriority, options: PRIORITY_OPTS },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{f.label}</label>
                  <select value={f.value} onChange={e => f.onChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }}>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Assigned To</label>
              <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Team member name..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Internal Notes</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2}
                placeholder="Notes visible only to admins..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Response */}
            {selected.respondedAt && (
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                <p style={{ margin: '0 0 4px', color: 'var(--green, #22c55e)', fontSize: 11, fontWeight: 600 }}>Previous Response — {fmtDateTime(selected.respondedAt)}</p>
                <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 12 }}>{selected.response}</p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Reply to Customer</label>
              <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3}
                placeholder="Type your response..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <ActionBtn onClick={() => setSelected(null)}>Cancel</ActionBtn>
              <ActionBtn onClick={() => handleUpdate(false)} disabled={saving}>Save</ActionBtn>
              <ActionBtn onClick={() => handleUpdate(true)} variant="primary" disabled={saving || !response}>
                <FiSend size={12} /> {saving ? 'Sending...' : 'Send & Save'}
              </ActionBtn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
