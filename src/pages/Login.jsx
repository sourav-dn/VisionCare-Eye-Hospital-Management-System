import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const ROLE_ROUTES = {
    admin:        '/admin',
    receptionist: '/receptionist',
    doctor:       '/doctor',
    patient:      '/patient',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.05))',
            border: '1px solid rgba(13,148,136,0.4)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Eye size={28} color="var(--color-teal-light)" />
          </div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontFamily: 'Outfit' }}>
            VisionCare
          </h1>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Eye Hospital Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', display: 'flex',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'block' }} />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <hr className="divider" style={{ margin: '1.5rem 0' }} />

        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Patient? &nbsp;
          <Link to="/register" style={{ color: 'var(--color-teal-light)', textDecoration: 'none', fontWeight: 500 }}>
            Create an account
          </Link>
        </div>

        {/* Demo hints */}
        <div className="alert alert-info" style={{ marginTop: '1.25rem', fontSize: '0.75rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Demo Credentials</div>
          <div>Admin: admin@visioncare.com / Admin@123</div>
          <div>Doctor: arjun@visioncare.com / Doctor@123</div>
          <div>Reception: reception@visioncare.com / Recept@123</div>
        </div>
      </div>
    </div>
  );
}
