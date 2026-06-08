import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiMap, FiPlus } from 'react-icons/fi';
import {
  apiFetch, fmtDate, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, ActionBtn, EmptyState, LoadingSkeleton, Modal,
} from './shared';

const PLAN_OPTS = [
  { value: 'free', label: 'Free' }, { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' },
];
const STATUS_OPTS = [
  { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' },
];

const BLANK_FORM = { name: '', slug: '', email: '', phone: '', plan: 'starter', status: 'active', 'address.city': '', 'address.state': '', description: '' };

export default function MultiBranch() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const [editModal, setEditModal] = useState(null); // null | 'new' | branch object
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (planFilter) params.set('plan', planFilter);
      const r = await apiFetch(`/branches?${params}`);
      setBranches(r.data || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [search, statusFilter, planFilter]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(BLANK_FORM);
    setEditModal('new');
  };

  const openEdit = (b) => {
    setForm({
      name: b.name || '', slug: b.slug || '', email: b.email || '', phone: b.phone || '',
      plan: b.plan || 'starter', status: b.status || 'active',
      'address.city': b.address?.city || '', 'address.state': b.address?.state || '',
      description: b.description || '',
    });
    setEditModal(b);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        email: form.email, phone: form.phone, plan: form.plan, status: form.status, description: form.description,
        address: { city: form['address.city'], state: form['address.state'] },
      };
      if (editModal === 'new') {
        await apiFetch('/branches', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Branch created');
      } else {
        await apiFetch(`/branches/${editModal._id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Branch updated');
      }
      setEditModal(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const activeBranches = branches.filter(b => b.status === 'active').length;
  const totalMembers = branches.reduce((s, b) => s + (b.memberCount || b.totalMembers || 0), 0);

  return (
    <div>
      <ModuleHeader
        title="Multi-Branch Management"
        description="Manage all gym locations, their plans, and member distribution"
        action={<ActionBtn variant="primary" onClick={openNew}><FiPlus size={13} /> New Branch</ActionBtn>}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPICard label="Total Branches" value={branches.length} />
        <KPICard label="Active Branches" value={activeBranches} color="var(--green, #22c55e)" />
        <KPICard label="Total Members" value={totalMembers} color="var(--accent)" />
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); }} placeholder="Search by name or city..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTS} placeholder="All Statuses" />
        <SelectFilter value={planFilter} onChange={setPlanFilter} options={PLAN_OPTS} placeholder="All Plans" />
        <ActionBtn onClick={load}>Refresh</ActionBtn>
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : branches.length === 0 ? (
          <EmptyState icon={FiMap} title="No branches found"
            sub="Create your first branch to manage multiple gym locations" />
        ) : (
          <Table heads={['Branch', 'Location', 'Plan', 'Status', 'Members', 'Trainers', 'Created', 'Actions']}>
            {branches.map(b => (
              <TR key={b._id}>
                <TD>
                  <div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{b.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{b.email}</div>
                  </div>
                </TD>
                <TD style={{ color: 'var(--text-2)', fontSize: 12 }}>
                  {[b.address?.city, b.address?.state].filter(Boolean).join(', ') || '—'}
                </TD>
                <TD><StatusBadge status="default" label={b.plan} /></TD>
                <TD><StatusBadge status={b.status} /></TD>
                <TD style={{ color: 'var(--text-1)', fontWeight: 700 }}>{(b.memberCount || b.totalMembers || 0).toLocaleString()}</TD>
                <TD style={{ color: 'var(--text-2)' }}>{b.trainerCount || b.totalTrainers || 0}</TD>
                <TD style={{ color: 'var(--text-2)' }}>{fmtDate(b.createdAt)}</TD>
                <TD>
                  <ActionBtn onClick={() => openEdit(b)} style={{ padding: '4px 10px' }}>Edit</ActionBtn>
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </TableCard>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal === 'new' ? 'New Branch' : `Edit: ${editModal?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'name', label: 'Branch Name', required: true },
            { key: 'email', label: 'Contact Email', type: 'email', required: true },
            { key: 'phone', label: 'Phone' },
            { key: 'address.city', label: 'City' },
            { key: 'address.state', label: 'State' },
            { key: 'description', label: 'Description' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>
                {f.label}{f.required ? ' *' : ''}
              </label>
              <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { key: 'plan', label: 'Plan', options: PLAN_OPTS },
              { key: 'status', label: 'Status', options: STATUS_OPTS },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }}>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <ActionBtn onClick={() => setEditModal(null)}>Cancel</ActionBtn>
            <ActionBtn onClick={handleSave} variant="primary" disabled={saving || !form.name || !form.email}>
              {saving ? 'Saving...' : editModal === 'new' ? 'Create Branch' : 'Save Changes'}
            </ActionBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
