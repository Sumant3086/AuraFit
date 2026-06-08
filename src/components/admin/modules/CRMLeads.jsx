import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiMessageCircle, FiUser } from 'react-icons/fi';
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

export default function CRMLeads() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editResponse, setEditResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const loadStats = useCallback(async () => {
    try { const r = await apiFetch('/leads/stats'); setStats(r.data); } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const r = await apiFetch(`/leads?${params}`);
      setData(r.data || []);
      setTotal(r.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { load(); }, [load]);

  const openEdit = (lead) => {
    setSelected(lead);
    setEditStatus(lead.status || 'new');
    setEditPriority(lead.priority || 'medium');
    setEditCategory(lead.category || 'general');
    setEditNotes(lead.adminNotes || '');
    setEditResponse(lead.response || '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await apiFetch(`/leads/${selected._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: editStatus, priority: editPriority, category: editCategory, adminNotes: editNotes, response: editResponse }),
      });
      toast.success('Lead updated');
      setSelected(null);
      loadStats();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pages = Math.ceil(total / 50);
  const byStatus = stats?.byStatus || [];
  const newCount = byStatus.find(s => s._id === 'new')?.count || 0;
  const inProgressCount = byStatus.find(s => s._id === 'in_progress')?.count || 0;
  const resolvedCount = byStatus.find(s => s._id === 'resolved')?.count || 0;

  return (
    <div>
      <ModuleHeader
        title="CRM & Lead Management"
        description="Manage inbound leads, contact requests, and customer conversations"
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="New Leads" value={newCount} color="var(--accent)" sub="Unprocessed" />
        <KPICard label="In Progress" value={inProgressCount} color="var(--amber, #f59e0b)" />
        <KPICard label="Resolved" value={resolvedCount} color="var(--green, #22c55e)" />
        <KPICard label="Last 7 Days" value={stats?.recent ?? '—'} sub="New inquiries" />
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, email, message..." />
        <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTS} placeholder="All Statuses" />
        <SelectFilter value={priorityFilter} onChange={v => { setPriorityFilter(v); setPage(1); }} options={PRIORITY_OPTS} placeholder="All Priorities" />
        <SelectFilter value={categoryFilter} onChange={v => { setCategoryFilter(v); setPage(1); }} options={CATEGORY_OPTS} placeholder="All Categories" />
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : data.length === 0 ? (
          <EmptyState icon={FiMessageCircle} title="No leads found" sub="Contact form submissions appear here" />
        ) : (
          <Table heads={['Contact', 'Category', 'Priority', 'Status', 'Submitted', 'Assigned', 'Actions']}>
            {data.map(lead => (
              <TR key={lead._id} onClick={() => openEdit(lead)}>
                <TD>
                  <div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{lead.email}</div>
                    {lead.phone && <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{lead.phone}</div>}
                  </div>
                </TD>
                <TD><StatusBadge status="default" label={lead.category || 'general'} /></TD>
                <TD>
                  <StatusBadge
                    status={lead.priority === 'urgent' || lead.priority === 'high' ? 'expired' : lead.priority === 'medium' ? 'pending' : 'active'}
                    label={lead.priority || 'medium'} />
                </TD>
                <TD><StatusBadge status={lead.status || 'new'} /></TD>
                <TD style={{ color: 'var(--text-2)' }}>{fmtDate(lead.createdAt)}</TD>
                <TD style={{ color: 'var(--text-2)' }}>{lead.assignedTo || '—'}</TD>
                <TD>
                  <ActionBtn onClick={e => { e.stopPropagation(); openEdit(lead); }} style={{ padding: '4px 10px' }}>Edit</ActionBtn>
                </TD>
              </TR>
            ))}
          </Table>
        )}
        <Pagination page={page} pages={pages} total={total} limit={50} onPage={setPage} />
      </TableCard>

      {/* Edit Lead Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Lead Detail">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Contact info */}
            <div style={{ background: 'var(--surface-3)', borderRadius: 10, padding: 14 }}>
              <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--text-1)' }}>{selected.name}</p>
              <p style={{ margin: '0 0 2px', color: 'var(--text-2)', fontSize: 13 }}>{selected.email}</p>
              {selected.phone && <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 12 }}>{selected.phone}</p>}
            </div>

            {/* Message */}
            <div>
              <p style={{ margin: '0 0 6px', color: 'var(--text-3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Message</p>
              <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, background: 'var(--surface-3)', padding: '10px 12px', borderRadius: 8 }}>
                {selected.message}
              </p>
            </div>

            {/* Status / Priority / Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Status', value: editStatus, onChange: setEditStatus, options: STATUS_OPTS },
                { label: 'Priority', value: editPriority, onChange: setEditPriority, options: PRIORITY_OPTS },
                { label: 'Category', value: editCategory, onChange: setEditCategory, options: CATEGORY_OPTS },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>{field.label}</label>
                  <select value={field.value} onChange={e => field.onChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }}>
                    {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Admin Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Internal Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                placeholder="Notes visible only to admins..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Response */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Response</label>
              <textarea value={editResponse} onChange={e => setEditResponse(e.target.value)} rows={3}
                placeholder="Response sent to customer..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <ActionBtn onClick={() => setSelected(null)}>Cancel</ActionBtn>
              <ActionBtn onClick={handleSave} variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</ActionBtn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
