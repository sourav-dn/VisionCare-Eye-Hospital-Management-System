const STATUS_CONFIG = {
  scheduled:               { label: 'Scheduled',           cls: 'badge-scheduled' },
  waiting:                 { label: 'Waiting',             cls: 'badge-waiting' },
  'in-consultation':       { label: 'In Consultation',     cls: 'badge-in-consultation' },
  'in-procedure':          { label: 'In Procedure',        cls: 'badge-in-procedure' },
  'ready-for-prescription':{ label: 'Ready for Rx',        cls: 'badge-ready' },
  completed:               { label: 'Completed',           cls: 'badge-completed' },
  cancelled:               { label: 'Cancelled',           cls: 'badge-cancelled' },
  active:                  { label: 'Active',              cls: 'badge-available' },
  maintenance:             { label: 'Maintenance',         cls: 'badge-in-procedure' },
  inactive:                { label: 'Inactive',            cls: 'badge-cancelled' },
  available:               { label: 'Available',           cls: 'badge-available' },
  unavailable:             { label: 'Unavailable',         cls: 'badge-unavailable' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'badge-waiting' };
  return (
    <span className={`badge ${config.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', opacity: 0.8 }} />
      {config.label}
    </span>
  );
}
