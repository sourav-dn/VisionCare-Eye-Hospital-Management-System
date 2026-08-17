import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Loader2 size={size} className="animate-spin" color="var(--color-teal)" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <Loader2 size={40} className="animate-spin" color="var(--color-teal)" />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading...</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '3rem', textAlign: 'center', gap: '0.75rem',
    }}>
      {Icon && (
        <div style={{
          width: 60, height: 60,
          borderRadius: '50%',
          background: 'var(--color-teal-glow)',
          border: '1px solid var(--color-teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <Icon size={28} color="var(--color-teal-light)" />
        </div>
      )}
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
      {description && <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: 300 }}>{description}</p>}
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'var(--color-teal)', sub }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 10,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={22} color={color} />}
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-text)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        {label}
      </div>
      {sub && <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color }}>{sub}</div>}
    </div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, fontFamily: 'Outfit' }}>{title}</h2>
      {action}
    </div>
  );
}
