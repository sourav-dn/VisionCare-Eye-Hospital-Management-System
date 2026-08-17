import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, DoorOpen, Building2, BarChart3,
  Ticket, ClipboardList, FileText, Calendar, History,
  LogOut, Eye, Stethoscope, UserCircle, ChevronRight, Settings,
} from 'lucide-react';

const ROLE_MENUS = {
  admin: [
    { to: '/admin',             label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/admin/doctors',     label: 'Doctors',      icon: Stethoscope },
    { to: '/admin/rooms',       label: 'Rooms',        icon: DoorOpen },
    { to: '/admin/departments', label: 'Departments',  icon: Building2 },
    { to: '/admin/staff',       label: 'Staff',        icon: Users },
    { to: '/admin/analytics',   label: 'Analytics',    icon: BarChart3 },
    { to: '/settings',          label: 'Settings',     icon: Settings },
  ],
  receptionist: [
    { to: '/receptionist',              label: 'Dashboard',      icon: LayoutDashboard },
    { to: '/receptionist/new-ticket',   label: 'New Ticket',     icon: Ticket },
    { to: '/receptionist/queue',        label: 'Today\'s Queue', icon: ClipboardList },
    { to: '/receptionist/prescriptions',label: 'Prescriptions',  icon: FileText },
    { to: '/settings',                  label: 'Settings',       icon: Settings },
  ],
  doctor: [
    { to: '/doctor',           label: 'My Queue',        icon: ClipboardList },
    { to: '/doctor/history',   label: 'Patient History', icon: History },
    { to: '/settings',         label: 'Settings',        icon: Settings },
  ],
  patient: [
    { to: '/patient',          label: 'My Portal',       icon: UserCircle },
    { to: '/patient/book',     label: 'Book Appointment',icon: Calendar },
    { to: '/patient/history',  label: 'My History',      icon: History },
    { to: '/settings',         label: 'Settings',        icon: Settings },
  ],
};

const ROLE_LABELS = {
  admin:        'Admin Panel',
  receptionist: 'Reception',
  doctor:       'Doctor Portal',
  patient:      'Patient Portal',
};

const ROLE_COLORS = {
  admin:        '#6366F1',
  receptionist: '#F59E0B',
  doctor:       '#0D9488',
  patient:      '#3B82F6',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  if (!user) return null;

  const menuItems  = ROLE_MENUS[user.role] || [];
  const roleLabel  = ROLE_LABELS[user.role];
  const roleColor  = ROLE_COLORS[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 40, height: 40,
          background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}11)`,
          border: `1px solid ${roleColor}44`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Eye size={20} color={roleColor} />
        </div>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: '#E2E8F0' }}>
            VisionCare
          </div>
          <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: 500 }}>
            {roleLabel}
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{
        padding: '1rem 1.25rem 0.75rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          background: 'var(--color-surface-3)',
          borderRadius: 10,
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: `${roleColor}22`,
            border: `1px solid ${roleColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: roleColor,
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {user.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user.name?.charAt(0)?.toUpperCase()
            }
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
              {user.department?.name || user.role}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div style={{ padding: '0 0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-dim)', textTransform: 'uppercase', paddingLeft: '0.5rem' }}>
            Navigation
          </span>
        </div>
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/doctor' || to === '/patient' || to === '/receptionist'}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={14} style={{ opacity: 0.4 }} />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem' }}>
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
