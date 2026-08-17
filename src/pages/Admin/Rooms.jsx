import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import Topbar from '../../components/Topbar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { PageLoader, EmptyState, SectionHeader } from '../../components/UI';
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { roomNumber: '', department: '', status: 'active', notes: '' };

export default function AdminRooms() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editRoom,   setEditRoom]   = useState(null);
  const [deleteRoom, setDeleteRoom] = useState(null);
  const [assignRoom, setAssignRoom] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [doctorId, setDoctorId] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: rooms,   isLoading } = useQuery({ queryKey: ['admin-rooms'],       queryFn: () => adminApi.getRooms().then((r) => r.data.data) });
  const { data: depts }              = useQuery({ queryKey: ['admin-departments'],  queryFn: () => adminApi.getDepartments().then((r) => r.data.data) });
  const { data: doctors }            = useQuery({ queryKey: ['admin-doctors'],      queryFn: () => adminApi.getDoctors().then((r) => r.data.data) });

  const mut = (fn, msg, reset) => useMutation({
    mutationFn: fn,
    onSuccess: () => { qc.invalidateQueries(['admin-rooms', 'admin-doctors']); toast.success(msg); reset(); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const createMut = useMutation({ mutationFn: (d) => adminApi.createRoom(d), onSuccess: () => { qc.invalidateQueries(['admin-rooms']); toast.success('Room created'); setShowCreate(false); setForm(EMPTY); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const updateMut = useMutation({ mutationFn: ({ id, d }) => adminApi.updateRoom(id, d), onSuccess: () => { qc.invalidateQueries(['admin-rooms']); toast.success('Room updated'); setEditRoom(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const deleteMut = useMutation({ mutationFn: (id) => adminApi.deleteRoom(id), onSuccess: () => { qc.invalidateQueries(['admin-rooms']); toast.success('Room deleted'); setDeleteRoom(null); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });
  const assignMut = useMutation({ mutationFn: ({ id, did }) => adminApi.assignDoctor(id, { doctorId: did || null }), onSuccess: () => { qc.invalidateQueries(['admin-rooms', 'admin-doctors']); toast.success('Assignment updated'); setAssignRoom(null); setDoctorId(''); }, onError: (e) => toast.error(e.response?.data?.message || 'Failed') });

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <Topbar title="Manage Rooms" subtitle="Create rooms and assign doctors dynamically" />
      <div style={{ padding: '1.5rem' }}>
        <SectionHeader
          title={`Rooms (${rooms?.length || 0})`}
          action={<button id="add-room-btn" className="btn btn-primary" onClick={() => { setShowCreate(true); setForm(EMPTY); }}><Plus size={16} /> Add Room</button>}
        />

        {!rooms?.length
          ? <EmptyState icon={DoorOpen} title="No rooms yet" description="Create rooms and assign doctors to them" />
          : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Room</th><th>Department</th><th>Assigned Doctor</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <span style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 8, padding: '4px 10px', fontWeight: 700, color: 'var(--color-teal-light)' }}>
                          Room {r.roomNumber}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{r.department?.name || '—'}</td>
                      <td>
                        {r.assignedDoctor
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-accent-glow)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#818CF8' }}>{r.assignedDoctor.name?.charAt(0)}</div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{r.assignedDoctor.name}</span>
                            </div>
                          : <span style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>Unassigned</span>}
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-ghost btn-sm" title="Assign Doctor" onClick={() => { setAssignRoom(r); setDoctorId(r.assignedDoctor?._id || ''); }}><DoorOpen size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => { setEditRoom(r); setForm({ roomNumber: r.roomNumber, department: r.department?._id || '', status: r.status, notes: r.notes || '' }); }}><Pencil size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteRoom(r)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Room" onConfirm={() => createMut.mutate(form)} confirmLabel="Create Room" loading={createMut.isPending}>
        <RoomForm form={form} set={set} depts={depts || []} />
      </Modal>

      <Modal isOpen={!!editRoom} onClose={() => setEditRoom(null)} title={`Edit Room ${editRoom?.roomNumber}`} onConfirm={() => updateMut.mutate({ id: editRoom._id, d: form })} confirmLabel="Save" loading={updateMut.isPending}>
        <RoomForm form={form} set={set} depts={depts || []} />
      </Modal>

      <Modal isOpen={!!assignRoom} onClose={() => { setAssignRoom(null); setDoctorId(''); }} title={`Assign Doctor — Room ${assignRoom?.roomNumber}`}
        onConfirm={() => assignMut.mutate({ id: assignRoom._id, did: doctorId })} confirmLabel="Assign" loading={assignMut.isPending}>
        <div className="form-group">
          <label className="label">Select Doctor</label>
          <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">None (Unassign Room)</option>
            {(doctors || []).map((d) => (
              <option key={d._id} value={d._id}>{d.name} — {d.department?.name || 'No dept'}</option>
            ))}
          </select>
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          The selected doctor will be unassigned from any previous room automatically.
        </p>
      </Modal>

      <Modal isOpen={!!deleteRoom} onClose={() => setDeleteRoom(null)} title="Delete Room"
        onConfirm={() => deleteMut.mutate(deleteRoom._id)} confirmLabel="Delete" confirmVariant="danger" loading={deleteMut.isPending}>
        <p style={{ color: 'var(--color-text-muted)' }}>Delete <strong style={{ color: 'var(--color-text)' }}>Room {deleteRoom?.roomNumber}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function RoomForm({ form, set, depts }) {
  return (
    <>
      <div className="grid-2">
        <div className="form-group"><label className="label">Room Number *</label><input className="input" value={form.roomNumber} onChange={set('roomNumber')} placeholder="e.g. 101" required /></div>
        <div className="form-group">
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Department *</label>
        <select className="input" value={form.department} onChange={set('department')} required>
          <option value="">Select department...</option>
          {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="label">Notes</label><textarea className="input" value={form.notes} onChange={set('notes')} placeholder="Any notes about this room..." /></div>
    </>
  );
}
