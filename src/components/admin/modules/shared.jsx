// Shared utilities for admin modules

export const API_BASE = '/api/admin';

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

export const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export const exportCSV = async (path, filename) => {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const fmtCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const daysSince = (d) => {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d)) / 86400000);
};

// Status color mapping
export const statusColor = (status) => {
  const map = {
    active: 'var(--green)', paid: 'var(--green)', confirmed: 'var(--green)', completed: 'var(--green)', resolved: 'var(--green)', delivered: 'var(--green)',
    pending: 'var(--amber)', in_progress: 'var(--amber)', processing: 'var(--amber)', almost_full: 'var(--amber)',
    expired: 'var(--red)', cancelled: 'var(--red)', failed: 'var(--red)', churned: 'var(--red)', full: 'var(--red)', no_show: 'var(--red)',
    new: 'var(--accent)', open: 'var(--accent)', available: 'var(--green)',
    suspended: 'var(--orange, #f97316)', dormant: 'var(--orange, #f97316)',
  };
  return map[(status || '').toLowerCase()] || 'var(--text-3)';
};

export const StatusBadge = ({ status, label }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: `${statusColor(status)}22`,
    color: statusColor(status),
    border: `1px solid ${statusColor(status)}44`,
    whiteSpace: 'nowrap',
    textTransform: 'capitalize',
  }}>
    {label || status || '—'}
  </span>
);

export const ModuleHeader = ({ title, description, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
    <div>
      <h2 style={{ color: 'var(--text-1)', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{title}</h2>
      {description && <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>{description}</p>}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

export const KPICard = ({ label, value, sub, color = 'var(--accent)' }) => (
  <div style={{
    background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14,
    padding: '16px 20px', flex: '1 1 160px', minWidth: 140,
  }}>
    <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{label}</p>
    <p style={{ color, fontSize: 26, fontWeight: 800, margin: '0 0 2px', lineHeight: 1 }}>{value ?? '—'}</p>
    {sub && <p style={{ color: 'var(--text-3)', fontSize: 11, margin: 0 }}>{sub}</p>}
  </div>
);

export const TableCard = ({ children, style }) => (
  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 14, overflow: 'hidden', ...style }}>
    <div style={{ overflowX: 'auto' }}>{children}</div>
  </div>
);

export const Table = ({ heads, children, empty }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
    <thead>
      <tr style={{ background: 'var(--surface-3)' }}>
        {heads.map((h, i) => (
          <th key={i} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-1)' }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export const TR = ({ children, onClick }) => (
  <tr onClick={onClick} style={{ borderBottom: '1px solid var(--border-1)', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'var(--surface-3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
    {children}
  </tr>
);

export const TD = ({ children, style }) => (
  <td style={{ padding: '10px 14px', color: 'var(--text-2)', verticalAlign: 'middle', ...style }}>{children}</td>
);

export const FilterBar = ({ children }) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
);

export const SearchInput = ({ value, onChange, placeholder }) => (
  <input
    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search...'}
    style={{ flex: '1 1 220px', minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }}
  />
);

export const SelectFilter = ({ value, onChange, options, placeholder }) => (
  <select
    value={value} onChange={e => onChange(e.target.value)}
    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13, minWidth: 130 }}
  >
    <option value="">{placeholder || 'All'}</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export const DateInput = ({ value, onChange, label }) => (
  <input type="date" value={value} onChange={e => onChange(e.target.value)}
    title={label}
    style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 13 }}
  />
);

export const ActionBtn = ({ onClick, variant = 'default', disabled, children, style }) => {
  const variants = {
    default: { background: 'var(--surface-3)', border: '1px solid var(--border-1)', color: 'var(--text-1)' },
    primary: { background: 'var(--accent)', border: '1px solid var(--accent)', color: '#fff' },
    danger: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--red, #ef4444)' },
    success: { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--green, #22c55e)' },
    export: { background: 'rgba(var(--accent-rgb,99,102,241),0.12)', border: '1px solid var(--accent)', color: 'var(--accent)' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '7px 14px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

export const EmptyState = ({ icon: Icon, title, sub }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
    {Icon && <Icon size={40} style={{ marginBottom: 12, opacity: 0.25 }} />}
    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-2)' }}>{title}</p>
    {sub && <p style={{ margin: '6px 0 0', fontSize: 12 }}>{sub}</p>}
  </div>
);

export const LoadingSkeleton = ({ rows = 5, height = 52 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} style={{ height, background: 'var(--surface-3)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
    ))}
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'relative', background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '24px', maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Pagination = ({ page, pages, total, limit, onPage }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border-1)', fontSize: 12, color: 'var(--text-3)' }}>
      <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => onPage(page - 1)} disabled={page <= 1}>Prev</ActionBtn>
        <span style={{ padding: '7px 12px', color: 'var(--text-1)', fontWeight: 600 }}>{page} / {pages}</span>
        <ActionBtn onClick={() => onPage(page + 1)} disabled={page >= pages}>Next</ActionBtn>
      </div>
    </div>
  );
};
