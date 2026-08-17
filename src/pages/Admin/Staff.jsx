import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import Topbar from '../../components/Topbar';
import Modal from '../../components/Modal';
import { PageLoader, EmptyState, SectionHeader } from '../../components/UI';
import { Plus, Pencil, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStaff() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editStaff,  setEditStaff]  = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist', phone: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: staff, isLoading } = useQuery({ queryKey: ['admin-staff'], queryFn: () => adminApi.getStaff().then((r) => r.data.data) });

  const createMut = useMutation({ mutationFn: (d) => adminApi.createStaff(d), onSuccess: () => { qc.invalidateQueries(['admin-staff']); toast.success('Staff created'); setShowCreate(false); setForm({ name: '', email: '', password: '', role: 'receptionist', phone: '' }); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateStaff(id, d), onSuccess: () => { qc.invalidateQueries(['admin-staff']); toast.success('Updated'); setEditStaff(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });

  if (isLoading) return <PageLoader />;

  const ROLE_COLORS = { admin: '#6366F1', receptionist: '#F59E0B' };

  return (
    <div className="animate-fadeIn">
      <Topbar title="Staff Management" subtitle="Manage receptionists and admin accounts" />
      <div style={{ padding: '1.5rem' }}>
        <SectionHeader title={`Staff (${staff?.length || 0})`}
          action={<button id="add-staff-btn" className="btn btn-primary" onClick={() => { setShowCreate(true); setForm({ name: '', email: '', password: '', role: 'receptionist', phone: '' }); }}><Plus size={16} /> Add Staff</button>} />

        {!staff?.length
          ? <EmptyState icon={Users} title="No staff accounts" description="Create receptionist or admin accounts" />
          : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ROLE_COLORS[s.role]}22`, border: `1px solid ${ROLE_COLORS[s.role]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: ROLE_COLORS[s.role], flexShrink: 0 }}>
                            {s.name?.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{s.email}</td>
                      <td>
                        <span style={{ background: `${ROLE_COLORS[s.role]}22`, border: `1px solid ${ROLE_COLORS[s.role]}44`, borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600, color: ROLE_COLORS[s.role], textTransform: 'capitalize' }}>
                          {s.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{s.phone || '—'}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditStaff(s); setForm({ name: s.name, email: s.email, password: '', role: s.role, phone: s.phone || '' }); }}><Pencil size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Staff Member" onConfirm={() => createMut.mutate(form)} confirmLabel="Create" loading={createMut.isPending}>
        <StaffForm form={form} set={set} isCreate />
      </Modal>

      <Modal isOpen={!!editStaff} onClose={() => setEditStaff(null)} title={`Edit — ${editStaff?.name}`} onConfirm={() => updateMut.mutate({ id: editStaff._id, d: form })} confirmLabel="Save" loading={updateMut.isPending}>
        <StaffForm form={form} set={set} />
      </Modal>
    </div>
  );
}

function StaffForm({ form, set, isCreate }) {
  return (
    <>
      <div className="grid-2">
        <div className="form-group"><label className="label">Full Name *</label><input className="input" value={form.name} onChange={set('name')} placeholder="Full name" required /></div>
        <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></div>
      </div>
      <div className="form-group"><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
      {isCreate && <div className="form-group"><label className="label">Password *</label><input className="input" type="password" value={form.password} onChange={set('password')} minLength={6} required /></div>}
      <div className="form-group">
        <label className="label">Role</label>
        <select className="input" value={form.role} onChange={set('role')}>
          <option value="receptionist">Receptionist</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </>
  );
}
