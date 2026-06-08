import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiActivity } from 'react-icons/fi';
import {
  apiFetch, StatusBadge,
  ModuleHeader, KPICard, TableCard, Table, TR, TD, FilterBar,
  SearchInput, SelectFilter, ActionBtn, EmptyState, LoadingSkeleton, Modal,
} from './shared';

const LEVEL_OPTS = [
  { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }, { value: 'all', label: 'All Levels' },
];

export default function ClassCapacity() {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('capacity'); // capacity | performance

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editModal, setEditModal] = useState(null);
  const [editCapacity, setEditCapacity] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = view === 'performance' ? '/class-ops/performance' : '/class-ops/capacity';
      const r = await apiFetch(endpoint);
      setClasses(r.data || []);
      setStats(r.stats || null);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [view]);

  useEffect(() => { load(); }, [load]);

  const filtered = classes.filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.instructor?.toLowerCase().includes(search.toLowerCase())) return false;
    if (levelFilter && c.level !== levelFilter) return false;
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    if (statusFilter === 'full' && c.status !== 'full') return false;
    if (statusFilter === 'available' && c.status !== 'available') return false;
    return true;
  });

  const openEdit = (cls) => {
    setEditModal(cls);
    setEditCapacity(String(cls.capacity || 20));
    setEditActive(cls.isActive !== false);
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await apiFetch(`/class-ops/${editModal._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ capacity: parseInt(editCapacity), isActive: editActive }),
      });
      toast.success('Class updated');
      setEditModal(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const fillColor = (rate) => {
    if (rate >= 100) return 'var(--red, #ef4444)';
    if (rate >= 80) return 'var(--amber, #f59e0b)';
    return 'var(--green, #22c55e)';
  };

  return (
    <div>
      <ModuleHeader title="Class & Capacity Management" description="Real-time enrollment, capacity utilization, and class performance" />

      {stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <KPICard label="Total Classes" value={stats.total} />
          <KPICard label="Full Classes" value={stats.full} color="var(--red, #ef4444)" sub="At 100% capacity" />
          <KPICard label="Almost Full" value={stats.almostFull} color="var(--amber, #f59e0b)" sub="80%+ capacity" />
          <KPICard label="Total Enrollments" value={(stats.totalEnrollments || 0).toLocaleString()} color="var(--accent)" />
          <KPICard label="Overall Fill Rate"
            value={`${stats.totalCapacity > 0 ? Math.round((stats.totalEnrollments / stats.totalCapacity) * 100) : 0}%`}
            color="var(--green, #22c55e)" />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ id: 'capacity', label: 'Live Capacity' }, { id: 'performance', label: 'Performance' }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-1)', cursor: 'pointer', fontWeight: 600, fontSize: 12,
              background: view === v.id ? 'var(--accent)' : 'var(--surface-2)', color: view === v.id ? '#fff' : 'var(--text-2)' }}>
            {v.label}
          </button>
        ))}
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search class or instructor..." />
        <SelectFilter value={levelFilter} onChange={setLevelFilter} options={LEVEL_OPTS} placeholder="All Levels" />
        <SelectFilter value={statusFilter} onChange={setStatusFilter}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'full', label: 'Full' }, { value: 'available', label: 'Has Space' }]}
          placeholder="All Statuses" />
      </FilterBar>

      <TableCard>
        {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
          <EmptyState icon={FiActivity} title="No classes found" sub="Seed data or adjust filters" />
        ) : (
          <Table heads={['Class', 'Instructor', 'Schedule', 'Level', 'Enrolled', 'Capacity', 'Fill Rate', 'Status', 'Actions']}>
            {filtered.map(cls => {
              const fillRate = cls.fillRate ?? (cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0);
              return (
                <TR key={cls._id}>
                  <TD style={{ color: 'var(--text-1)', fontWeight: 600 }}>{cls.name}</TD>
                  <TD style={{ color: 'var(--text-2)' }}>{cls.instructor}</TD>
                  <TD style={{ color: 'var(--text-2)', fontSize: 11 }}>{cls.schedule?.day} {cls.schedule?.time}</TD>
                  <TD><StatusBadge status="default" label={cls.level} /></TD>
                  <TD style={{ color: 'var(--text-1)', fontWeight: 700 }}>{cls.enrolled || 0}</TD>
                  <TD style={{ color: 'var(--text-2)' }}>{cls.capacity}</TD>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--surface-3)', borderRadius: 999 }}>
                        <div style={{ width: `${Math.min(100, fillRate)}%`, height: '100%', background: fillColor(fillRate), borderRadius: 999 }} />
                      </div>
                      <span style={{ color: fillColor(fillRate), fontSize: 12, fontWeight: 700 }}>{fillRate}%</span>
                    </div>
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {cls.status && <StatusBadge status={cls.status} />}
                      <StatusBadge status={cls.isActive !== false ? 'active' : 'cancelled'} label={cls.isActive !== false ? 'Active' : 'Inactive'} />
                    </div>
                  </TD>
                  <TD>
                    <ActionBtn onClick={() => openEdit(cls)} style={{ padding: '4px 10px' }}>Edit</ActionBtn>
                  </TD>
                </TR>
              );
            })}
          </Table>
        )}
      </TableCard>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit: ${editModal?.name}`}>
        {editModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Capacity</label>
              <input type="number" value={editCapacity} onChange={e => setEditCapacity(e.target.value)} min={1}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 14, boxSizing: 'border-box' }} />
              <p style={{ margin: '4px 0 0', color: 'var(--text-3)', fontSize: 11 }}>Currently {editModal.enrolled || 0} enrolled</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="isActive" checked={editActive} onChange={e => setEditActive(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="isActive" style={{ color: 'var(--text-2)', fontSize: 14, cursor: 'pointer' }}>Class is active</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <ActionBtn onClick={() => setEditModal(null)}>Cancel</ActionBtn>
              <ActionBtn onClick={handleUpdate} variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Update'}</ActionBtn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
