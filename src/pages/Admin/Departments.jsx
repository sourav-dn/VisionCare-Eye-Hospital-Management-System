import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import Topbar from '../../components/Topbar';
import Modal from '../../components/Modal';
import { PageLoader, EmptyState, SectionHeader } from '../../components/UI';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editDept,   setEditDept]   = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: depts, isLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn:  () => adminApi.getDepartments().then((r) => r.data.data),
  });

  const createMut = useMutation({ mutationFn: (d) => adminApi.createDepartment(d), onSuccess: () => { qc.invalidateQueries(['admin-departments']); toast.success('Department created'); setShowCreate(false); setForm({ name: '', description: '' }); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateDepartment(id, d), onSuccess: () => { qc.invalidateQueries(['admin-departments']); toast.success('Updated'); setEditDept(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const deleteMut = useMutation({ mutationFn: (id) => adminApi.deleteDepartment(id), onSuccess: () => { qc.invalidateQueries(['admin-departments']); toast.success('Deleted'); setDeleteDept(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });

  if (isLoading) return <PageLoader />;

  const DEPT_ICONS = ['👁️', '🔬', '🩺', '💊', '🧬'];

  return (
    <div className="animate-fadeIn">
      <Topbar title="Departments" subtitle="Manage hospital departments" />
      <div style={{ padding: '1.5rem' }}>
        <SectionHeader title={`Departments (${depts?.length || 0})`}
          action={<button id="add-dept-btn" className="btn btn-primary" onClick={() => { setShowCreate(true); setForm({ name: '', description: '' }); }}><Plus size={16} /> Add Department</button>} />

        {!depts?.length
          ? <EmptyState icon={Building2} title="No departments yet" description="Add departments to organize doctors and visits" />
          : (
            <div className="grid-3">
              {depts.map((d, i) => (
                <div key={d._id} className="card" style={{ position: 'relative' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{DEPT_ICONS[i % DEPT_ICONS.length]}</div>
                  <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontFamily: 'Outfit' }}>{d.name}</h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{d.description || 'No description'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditDept(d); setForm({ name: d.name, description: d.description || '' }); }}><Pencil size={13} /> Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteDept(d)}><Trash2 size={13} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Department" onConfirm={() => createMut.mutate(form)} confirmLabel="Create" loading={createMut.isPending}>
        <DeptForm form={form} set={set} />
      </Modal>

      <Modal isOpen={!!editDept} onClose={() => setEditDept(null)} title={`Edit — ${editDept?.name}`} onConfirm={() => updateMut.mutate({ id: editDept._id, d: form })} confirmLabel="Save" loading={updateMut.isPending}>
        <DeptForm form={form} set={set} />
      </Modal>

      <Modal isOpen={!!deleteDept} onClose={() => setDeleteDept(null)} title="Delete Department" onConfirm={() => deleteMut.mutate(deleteDept._id)} confirmLabel="Delete" confirmVariant="danger" loading={deleteMut.isPending}>
        <p style={{ color: 'var(--color-text-muted)' }}>Delete <strong style={{ color: 'var(--color-text)' }}>{deleteDept?.name}</strong>? This will fail if doctors or rooms are still linked to it.</p>
      </Modal>
    </div>
  );
}

function DeptForm({ form, set }) {
  return (
    <>
      <div className="form-group"><label className="label">Department Name *</label><input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Cornea" required autoFocus /></div>
      <div className="form-group"><label className="label">Description</label><textarea className="input" value={form.description} onChange={set('description')} placeholder="Brief description of this department..." /></div>
    </>
  );
}
