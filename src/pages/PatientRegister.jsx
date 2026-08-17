import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye as EyeIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientRegister() {
  const [form, setForm]   = useState({ name: '', email: '', password: '', phone: '', age: '', gender: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { authApi } = await import('../api');
      await authApi.registerPatient({ ...form, age: Number(form.age) });
      const user = await login(form.email, form.password);
      toast.success('Account created! Welcome to VisionCare.');
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.05))', border: '1px solid rgba(13,148,136,0.4)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <EyeIcon size={24} color="var(--color-teal-light)" />
          </div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.375rem', fontFamily: 'Outfit' }}>Create Patient Account</h1>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Book appointments and track your visits</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Full Name *</label>
              <input id="reg-name" className="input" value={form.name} onChange={set('name')} required placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label className="label">Phone Number *</label>
              <input id="reg-phone" className="input" value={form.phone} onChange={set('phone')} required placeholder="01XXXXXXXXX" />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Email Address *</label>
            <input id="reg-email" className="input" type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
          </div>

          <div className="form-group">
            <label className="label">Password *</label>
            <input id="reg-password" className="input" type="password" value={form.password} onChange={set('password')} required placeholder="Min 6 characters" minLength={6} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Age</label>
              <input id="reg-age" className="input" type="number" value={form.age} onChange={set('age')} placeholder="Age" min={0} max={150} />
            </div>
            <div className="form-group">
              <label className="label">Gender</label>
              <select id="reg-gender" className="input" value={form.gender} onChange={set('gender')}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Address</label>
            <input id="reg-address" className="input" value={form.address} onChange={set('address')} placeholder="Your address (optional)" />
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Already have an account? &nbsp;
          <Link to="/login" style={{ color: 'var(--color-teal-light)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
