import { Clock, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useOutletContext } from 'react-router-dom';

export default function Topbar({ title, subtitle }) {
  const { user }      = useAuth();
  const { connected } = useSocket() || {};

  // Get the toggle handler from RoleLayout via outlet context (graceful fallback)
  let outletCtx = null;
  try {
    outletCtx = useOutletContext();
  } catch (_) { /* not inside an Outlet — no-op */ }
  const onMenuToggle = outletCtx?.onMenuToggle;

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const timeOnly = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <header className="topbar">
      {/* Left: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
        {/* Hamburger — only visible on mobile via CSS */}
        {onMenuToggle && (
          <button
            className="hamburger-btn"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="topbar-title-group">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {/* Right: live indicator + date + avatar */}
      <div className="topbar-right">
        {/* Live indicator */}
        {user?.role !== 'patient' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            <span className="live-dot" style={{ background: connected ? 'var(--color-success)' : 'var(--color-danger)' }} />
            <span className="hide-mobile">{connected ? 'Live' : 'Offline'}</span>
          </div>
        )}

        {/* Date — hidden on very small screens via .topbar-date */}
        <div className="topbar-date" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
          <Clock size={13} />
          {/* Show short time on mobile, full date on desktop */}
          <span className="hide-mobile">{now}</span>
          <span className="show-mobile">{timeOnly}</span>
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
          flexShrink: 0,
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
