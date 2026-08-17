import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Topbar({ title, subtitle }) {
  const { user }      = useAuth();
  const { connected } = useSocket() || {};

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="topbar">
      <div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Live indicator */}
        {user?.role !== 'patient' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span className="live-dot" style={{ background: connected ? 'var(--color-success)' : 'var(--color-danger)' }} />
            {connected ? 'Live' : 'Offline'}
          </div>
        )}

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <Clock size={13} />
          {now}
        </div>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'var(--color-teal-glow)',
          border: '1px solid var(--color-teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-teal-light)',
          overflow: 'hidden',
        }}>
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user?.name?.charAt(0)?.toUpperCase()
          }
        </div>
      </div>
    </header>
  );
}
