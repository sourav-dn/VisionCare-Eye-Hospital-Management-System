import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import toast from 'react-hot-toast';
import { Camera, User, Lock, Save, Eye, EyeOff, Upload, Trash2 } from 'lucide-react';

const ROLE_COLORS = {
  admin:        '#6366F1',
  receptionist: '#F59E0B',
  doctor:       '#0D9488',
  patient:      '#3B82F6',
};

export default function Settings() {
  const { user, updateUser } = useAuth();
  const roleColor = ROLE_COLORS[user?.role] || '#0D9488';

  // ── Avatar state ──────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview]   = useState(user?.avatar || null);
  const [avatarBase64,  setAvatarBase64]    = useState(null);
  const [isDragging,    setIsDragging]      = useState(false);
  const fileInputRef = useRef();

  // ── Profile form ──────────────────────────────────────────────────
  const [name,  setName]  = useState(user?.name  || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // ── Password form ─────────────────────────────────────────────────
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);

  // ── Mutations ─────────────────────────────────────────────────────
  const profileMut = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.user);
      setAvatarBase64(null); // clear pending base64 after save
      toast.success('Profile updated!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const passwordMut = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast.success('Password changed successfully!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Password change failed'),
  });

  // ── Handlers ──────────────────────────────────────────────────────
  const readFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Image must be under 5MB');      return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
      setAvatarBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    readFile(e.dataTransfer.files[0]);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarBase64('REMOVE');
  };

  const handleProfileSave = () => {
    const payload = { name, phone };
    if (avatarBase64 === 'REMOVE') payload.removeAvatar = true;
    else if (avatarBase64)         payload.avatarBase64 = avatarBase64;
    profileMut.mutate(payload);
  };

  const handlePasswordSave = () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error('All password fields are required'); return; }
    if (newPw.length < 6)                   { toast.error('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw)                { toast.error('Passwords do not match'); return; }
    passwordMut.mutate({ currentPassword: currentPw, newPassword: newPw });
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="animate-fadeIn">
      <Topbar title="Settings" subtitle="Manage your profile and account security" />

      <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>

        {/* ── Avatar Card ───────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Camera size={18} color={roleColor} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit' }}>Profile Picture</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: avatarPreview ? 'transparent' : `${roleColor}22`,
                border: `2px solid ${roleColor}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', fontSize: '2.5rem', fontWeight: 800,
                color: roleColor, fontFamily: 'Outfit',
              }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              {avatarPreview && (
                <button
                  onClick={removeAvatar}
                  title="Remove photo"
                  style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--color-danger)', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={12} color="#fff" />
                </button>
              )}
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                flex: 1, minWidth: 200,
                border: `2px dashed ${isDragging ? roleColor : 'var(--color-border-2)'}`,
                borderRadius: 12,
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                background: isDragging ? `${roleColor}0d` : 'var(--color-surface-3)',
                transition: 'all 0.2s',
              }}
            >
              <Upload size={28} color={isDragging ? roleColor : 'var(--color-text-dim)'} />
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                <span style={{ color: roleColor, fontWeight: 600 }}>Click to upload</span> or drag & drop
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>PNG, JPG, WEBP — max 5 MB</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => readFile(e.target.files[0])}
            />
          </div>
        </div>

        {/* ── Profile Info Card ─────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={18} color={roleColor} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit' }}>Profile Information</h2>
          </div>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Full Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Phone Number</label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1XXX XXXXXX"
              />
            </div>
          </div>

          {/* Read-only info */}
          <div style={{
            background: 'var(--color-surface-3)', borderRadius: 8,
            padding: '0.875rem 1rem', marginBottom: '1.25rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
          }}>
            {[
              { label: 'Email',      value: user?.email },
              { label: 'Role',       value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
              { label: 'Department', value: user?.department?.name || '—' },
              { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleProfileSave}
            disabled={profileMut.isPending}
          >
            <Save size={15} />
            {profileMut.isPending ? 'Saving…' : 'Save Profile'}
          </button>
        </div>

        {/* ── Password Card ─────────────────────────────────────── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={18} color={roleColor} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit' }}>Change Password</h2>
          </div>

          {[
            { label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCur, toggle: () => setShowCur(v => !v) },
            { label: 'New Password',     val: newPw,     set: setNewPw,     show: showNew, toggle: () => setShowNew(v => !v) },
            { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw, show: showConf, toggle: () => setShowConf(v => !v) },
          ].map(({ label, val, set, show, toggle }) => (
            <div className="form-group" key={label}>
              <label className="label">{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={show ? 'text' : 'password'}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={toggle}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          {newPw && confirmPw && newPw !== confirmPw && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
              Passwords do not match
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handlePasswordSave}
            disabled={passwordMut.isPending}
          >
            <Lock size={15} />
            {passwordMut.isPending ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
