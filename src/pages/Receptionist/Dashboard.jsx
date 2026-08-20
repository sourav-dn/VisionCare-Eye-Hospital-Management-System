import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi, publicApi } from '../../api';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { StatCard, PageLoader } from '../../components/UI';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, Ticket, Plus, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReceptionistDashboard() {
  const { on, off } = useSocket() || {};
  const queryClient = useQueryClient();
  const [liveUpdates, setLiveUpdates] = useState(0);
  const [reassignVisit, setReassignVisit] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['today-stats'],
    queryFn:  () => visitApi.getTodayStats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: todayVisits, refetch: refetchVisits } = useQuery({
    queryKey: ['receptionist-queue'],
    queryFn:  () => visitApi.getAll({ limit: 50 }).then((r) => r.data.data),
    refetchInterval: 20000,
  });

  const { data: allDoctors } = useQuery({
    queryKey: ['public-doctors'],
    queryFn:  () => publicApi.getDoctors().then((r) => r.data.data),
  });

  const reassignMut = useMutation({
    mutationFn: ({ visitId, doctorId }) => visitApi.reassignDoctor(visitId, { doctorId }),
    onSuccess: () => {
      toast.success('Doctor assigned successfully!');
      queryClient.invalidateQueries(['receptionist-queue']);
      setReassignVisit(null);
      setSelectedDoctorId('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Assignment failed'),
  });

  // Live socket updates
  useEffect(() => {
    if (!on) return;
    const handler = () => { refetchVisits(); refetchStats(); setLiveUpdates((n) => n + 1); };
    on('queue-update', handler);
    return () => off?.('queue-update', handler);
  }, [on, off, refetchVisits, refetchStats]);

  const handleOpenReassign = (visit) => {
    setReassignVisit(visit);
    setSelectedDoctorId(visit.assignedDoctor?._id || '');
  };

  const handleSaveReassign = () => {
    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }
    reassignMut.mutate({ visitId: reassignVisit._id, doctorId: selectedDoctorId });
  };

  // Filter doctors that match the visit's department or allow all
  const filteredDoctors = (allDoctors || []).filter((doc) => {
    if (!reassignVisit?.department) return true;
    return doc.department?._id === reassignVisit.department._id || doc.department === reassignVisit.department._id;
  });

  return (
    <div className="animate-fadeIn">
      <Topbar title="Reception Dashboard" subtitle="Manage today's patient queue" />
      <div style={{ padding: '1.5rem' }}>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatCard label="Today's Total"     value={stats?.total}         icon={ClipboardList} color="#0D9488" />
          <StatCard label="Waiting"           value={stats?.waiting}       icon={Clock}         color="#F59E0B" />
          <StatCard label="In Consultation"   value={stats?.inConsultation}icon={Ticket}        color="#6366F1" />
          <StatCard label="Completed Today"   value={stats?.completed}     icon={CheckCircle2}  color="#10B981" />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/receptionist/new-ticket" className="btn btn-primary btn-lg" style={{ flex: '1 1 auto', justifyContent: 'center', minWidth: 160 }}>
            <Plus size={18} /> New Ticket
          </Link>
          <Link to="/receptionist/prescriptions" className="btn btn-secondary btn-lg" style={{ flex: '1 1 auto', justifyContent: 'center', minWidth: 160 }}>
            Ready for Pickup ({(todayVisits || []).filter((v) => v.status === 'ready-for-prescription').length})
          </Link>
        </div>

        {/* Today's queue table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit' }}>Today's Queue</h3>
            {liveUpdates > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-success)' }}>
                <span className="live-dot" />
                {liveUpdates} live update{liveUpdates > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {!todayVisits?.length ? (
            <div className="alert alert-info">No visits yet today. Create the first ticket!</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>#</th><th>Ticket</th><th>Patient</th><th>Department</th><th>Doctor</th><th>Room</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
                <tbody>
                  {todayVisits.map((v, i) => (
                    <tr key={v._id}>
                      <td style={{ color: 'var(--color-text-dim)', fontSize: '0.8125rem' }}>{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', background: 'var(--color-surface-3)', borderRadius: 4, padding: '2px 6px' }}>
                          {v.ticketNumber}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{v.patient?.name}</div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{v.patient?.phone}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{v.department?.name}</td>
                      <td>
                        {v.assignedDoctor?.name ? (
                          <span style={{ fontWeight: 500 }}>{v.assignedDoctor.name}</span>
                        ) : (
                          <span style={{ color: 'var(--color-warning)', fontSize: '0.8125rem', fontWeight: 600 }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        {v.roomNumber
                          ? <span style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 6, padding: '2px 8px', fontSize: '0.8125rem', color: 'var(--color-teal-light)' }}>Rm {v.roomNumber}</span>
                          : <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8125rem' }}>—</span>}
                      </td>
                      <td><StatusBadge status={v.status} /></td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {new Date(v.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenReassign(v)}
                          title="Assign or Reassign Doctor"
                        >
                          <UserCheck size={13} /> {v.assignedDoctor ? 'Change' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reassign Doctor Modal */}
        {reassignVisit && (
          <div className="modal-overlay" onClick={() => setReassignVisit(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
              <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.125rem' }}>
                  Assign Doctor
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setReassignVisit(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: 'var(--color-surface-3)', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                <div><strong>Patient:</strong> {reassignVisit.patient?.name} ({reassignVisit.ticketNumber})</div>
                <div style={{ marginTop: 4 }}><strong>Department:</strong> {reassignVisit.department?.name}</div>
                <div style={{ marginTop: 4 }}><strong>Current Doctor:</strong> {reassignVisit.assignedDoctor?.name || 'Unassigned'}</div>
              </div>

              <div className="form-group">
                <label className="label">Select Doctor</label>
                <select
                  className="input"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  <option value="">-- Choose a doctor --</option>
                  {(filteredDoctors.length > 0 ? filteredDoctors : (allDoctors || [])).map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.department?.name || 'General'}) {doc.currentRoom ? `• Room ${doc.currentRoom}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setReassignVisit(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={!selectedDoctorId || reassignMut.isPending}
                  onClick={handleSaveReassign}
                >
                  <UserCheck size={15} /> {reassignMut.isPending ? 'Saving...' : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
