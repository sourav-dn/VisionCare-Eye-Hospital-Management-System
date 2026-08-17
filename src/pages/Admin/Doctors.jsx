import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import Topbar from '../../components/Topbar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { PageLoader, EmptyState, SectionHeader } from '../../components/UI';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Stethoscope, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', email: '', password: '', department: '', phone: '' };

export default function AdminDoctors() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editDoc,    setEditDoc]    = useState(null);
  const [deleteDoc,  setDeleteDoc]  = useState(null);
  const [assignDoc,  setAssignDoc]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [roomId,     setRoomId]     = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn:  () => adminApi.getDoctors().then((r) => r.data.data),
  });

  const { data: depts } = useQuery({
    queryKey: ['admin-departments'],
    queryFn:  () => adminApi.getDepartments().then((r) => r.data.data),
  });

  const { data: rooms } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn:  () => adminApi.getRooms().then((r) => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: (data) => adminApi.createDoctor(data),
    onSuccess: () => { qc.invalidateQueries(['admin-doctors']); toast.success('Doctor created'); setShowCreate(false); setForm(EMPTY_FORM); },
    onError:   (e)  => toast.error(e.response?.data?.message || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateDoctor(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-doctors']); toast.success('Doctor updated'); setEditDoc(null); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => adminApi.toggleAvailability(id),
    onSuccess: () => { qc.invalidateQueries(['admin-doctors']); toast.success('Availability updated'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteDoctor(id),
    onSuccess: () => { qc.invalidateQueries(['admin-doctors']); toast.success('Doctor deactivated'); setDeleteDoc(null); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const assignMut = useMutation({
    mutationFn: ({ roomId, doctorId }) => adminApi.assignDoctor(roomId, { doctorId }),
    onSuccess: () => { qc.invalidateQueries(['admin-doctors', 'admin-rooms']); toast.success('Room assigned'); setAssignDoc(null); setRoomId(''); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <PageLoader />;

  const openEdit = (doc) => { setEditDoc(doc); setForm({ name: doc.name, email: doc.email, password: '', department: doc.department?._id || '', phone: doc.phone || '' }); };

  // Rooms not yet assigned (or currently assigned to this doctor)
  const availableRooms = (rooms || []).filter(r => !r.assignedDoctor || r.assignedDoctor?._id === assignDoc?._id);

  return (
    <div className="animate-fadeIn">
      <Topbar title="Manage Doctors" subtitle="Add, edit, and assign rooms to doctors" />

      <div style={{ padding: '1.5rem' }}>
        <SectionHeader
          title={`Doctors (${doctors?.length || 0})`}
          action={
            <button id="add-doctor-btn" className="btn btn-primary" onClick={() => { setShowCreate(true); setForm(EMPTY_FORM); }}>
              <Plus size={16} /> Add Doctor
            </button>
          }
        />

        {!doctors?.length ? (
          <EmptyState icon={Stethoscope} title="No doctors yet" description="Add your first doctor to get started" action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Add Doctor</button>} />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th><th>Email</th><th>Department</th>
                  <th>Room</th><th>Availability</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-teal-light)', flexShrink: 0 }}>
                          {doc.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{doc.email}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{doc.department?.name || '—'}</td>
                    <td>
                      {doc.currentRoom
                        ? <span style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 6, padding: '2px 8px', fontSize: '0.8125rem', color: 'var(--color-teal-light)' }}>Room {doc.currentRoom.roomNumber}</span>
                        : <span className="text-dim" style={{ fontSize: '0.8125rem' }}>Unassigned</span>}
                    </td>
                    <td>
                      <button onClick={() => toggleMut.mutate(doc._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: doc.isAvailable ? 'var(--color-success)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {doc.isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        <span style={{ fontSize: '0.75rem' }}>{doc.isAvailable ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm" title="Assign Room" onClick={() => { setAssignDoc(doc); setRoomId(doc.currentRoom?._id || ''); }}><DoorOpen size={14} /></button>
                        <button className="btn btn-ghost btn-sm" title="Edit"       onClick={() => openEdit(doc)}><Pencil size={14} /></button>
                        <button className="btn btn-ghost btn-sm" title="Deactivate" onClick={() => setDeleteDoc(doc)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Doctor Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Doctor"
        onConfirm={() => createMut.mutate(form)} confirmLabel="Create Doctor" loading={createMut.isPending}>
        <DoctorForm form={form} set={set} depts={depts || []} isCreate />
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal isOpen={!!editDoc} onClose={() => setEditDoc(null)} title={`Edit — ${editDoc?.name}`}
        onConfirm={() => updateMut.mutate({ id: editDoc._id, data: form })} confirmLabel="Save Changes" loading={updateMut.isPending}>
        <DoctorForm form={form} set={set} depts={depts || []} />
      </Modal>

      {/* Assign Room Modal */}
      <Modal isOpen={!!assignDoc} onClose={() => { setAssignDoc(null); setRoomId(''); }} title={`Assign Room — ${assignDoc?.name}`}
        onConfirm={() => assignMut.mutate({ roomId, doctorId: assignDoc._id })} confirmLabel="Assign" loading={assignMut.isPending}>
        <div className="form-group">
          <label className="label">Select Room</label>
          <select className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">None (Unassign)</option>
            {(rooms || []).map((r) => (
              <option key={r._id} value={r._id}>Room {r.roomNumber} — {r.department?.name}</option>
            ))}
          </select>
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Assigning a new room will automatically unassign this doctor from their previous room.
        </p>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteDoc} onClose={() => setDeleteDoc(null)} title="Deactivate Doctor"
        onConfirm={() => deleteMut.mutate(deleteDoc._id)} confirmLabel="Deactivate" confirmVariant="danger" loading={deleteMut.isPending}>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Are you sure you want to deactivate <strong style={{ color: 'var(--color-text)' }}>{deleteDoc?.name}</strong>? They will be unassigned from all rooms and will no longer appear in scheduling.
        </p>
      </Modal>
    </div>
  );
}

function DoctorForm({ form, set, depts, isCreate }) {
  return (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label className="label">Full Name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Dr. John Smith" required />
        </div>
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Email *</label>
        <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="doctor@visioncare.com" required />
      </div>
      {isCreate && (
        <div className="form-group">
          <label className="label">Password *</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" minLength={6} required />
        </div>
      )}
      <div className="form-group">
        <label className="label">Department</label>
        <select className="input" value={form.department} onChange={set('department')}>
          <option value="">Select department...</option>
          {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>
    </>
  );
}
