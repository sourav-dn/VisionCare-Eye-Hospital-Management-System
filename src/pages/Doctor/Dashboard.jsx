import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '../../api';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { PageLoader, EmptyState } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ConsultationModal from './ConsultationModal';
import { ClipboardList, Clock, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_ORDER = ['waiting', 'in-consultation', 'in-procedure', 'ready-for-prescription', 'scheduled'];

export default function DoctorDashboard() {
  const { user }    = useAuth();
  const { on, off } = useSocket() || {};
  const qc          = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: queue, isLoading, refetch } = useQuery({
    queryKey: ['doctor-queue'],
    queryFn:  () => visitApi.getAll({ limit: 50 }).then((r) => r.data.data),
    refetchInterval: 30000,
  });

  // Real-time new ticket notifications
  useEffect(() => {
    if (!on) return;
    const handleNew = (data) => {
      toast.success(`New patient: ${data.patient?.name}`, { icon: '🔔', duration: 5000 });
      refetch();
    };
    const handleStatusChange = () => refetch();
    on('new-ticket-assigned', handleNew);
    on('queue-update', handleStatusChange);
    return () => {
      off?.('new-ticket-assigned', handleNew);
      off?.('queue-update', handleStatusChange);
    };
  }, [on, off, refetch]);

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => visitApi.updateStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['doctor-queue']); toast.success('Status updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <PageLoader />;

  const active    = (queue || []).filter((v) => ['waiting', 'in-consultation', 'in-procedure'].includes(v.status));
  const ready     = (queue || []).filter((v) => v.status === 'ready-for-prescription');
  const scheduled = (queue || []).filter((v) => v.status === 'scheduled');

  const QueueSection = ({ title, visits, color, emptyMsg }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontFamily: 'Outfit' }}>{title} ({visits.length})</h3>
      </div>
      {!visits.length ? (
        <div style={{ padding: '0.875rem 1rem', borderRadius: 8, background: 'var(--color-surface-3)', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{emptyMsg}</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.625rem' }}>
          {visits.map((v, i) => (
            <TicketCard key={v._id} visit={v} index={i} onOpen={() => setSelected(v)} onStatusChange={(s) => statusMut.mutate({ id: v._id, status: s })} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <Topbar
        title={`Dr. ${user?.name?.replace('Dr. ', '')}`}
        subtitle={`${user?.department?.name || 'Ophthalmology'} — Today's Queue`}
      />
      <div style={{ padding: '1.5rem' }}>
        {/* Today summary strip */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Waiting',         count: active.filter((v) => v.status === 'waiting').length,          color: '#F59E0B' },
            { label: 'In Consultation', count: active.filter((v) => v.status === 'in-consultation').length,  color: '#0D9488' },
            { label: 'In Procedure',    count: active.filter((v) => v.status === 'in-procedure').length,     color: '#FB923C' },
            { label: 'Ready for Rx',    count: ready.length,                                                 color: '#60A5FA' },
            { label: 'Scheduled',       count: scheduled.length,                                             color: '#818CF8' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{s.label}</span>
              <span style={{ fontWeight: 800, fontFamily: 'Outfit', color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>

        {!queue?.length ? (
          <EmptyState icon={ClipboardList} title="No patients in your queue" description="Patients assigned to you will appear here in real-time" />
        ) : (
          <>
            <QueueSection title="Active Patients" visits={active} color="var(--color-teal)" emptyMsg="No active patients right now" />
            <QueueSection title="Ready for Prescription" visits={ready} color="var(--color-info)" emptyMsg="No patients waiting for prescription" />
            <QueueSection title="Scheduled" visits={scheduled} color="#818CF8" emptyMsg="No scheduled appointments" />
          </>
        )}
      </div>

      {/* Consultation Modal */}
      {selected && (
        <ConsultationModal
          visitId={selected._id}
          onClose={() => { setSelected(null); refetch(); }}
        />
      )}
    </div>
  );
}

function TicketCard({ visit, index, onOpen, onStatusChange }) {
  const timeStr = new Date(visit.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const STATUS_ACTIONS = {
    waiting:           { label: 'Start Consultation →', next: 'in-consultation', color: 'var(--color-teal)' },
    'in-consultation': { label: 'Mark: In Procedure →', next: 'in-procedure',    color: '#FB923C' },
    'in-procedure':    { label: 'Ready for Prescription →', next: 'ready-for-prescription', color: '#60A5FA' },
  };
  const action = STATUS_ACTIONS[visit.status];

  return (
    <div className="ticket-card" onClick={onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Queue number */}
        <div className="queue-num">{index + 1}</div>

        {/* Patient info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 600 }}>{visit.patient?.name}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', background: 'var(--color-surface-3)', borderRadius: 4, padding: '1px 5px', color: 'var(--color-text-muted)' }}>{visit.ticketNumber}</span>
            <StatusBadge status={visit.status} />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {visit.patient?.age} yrs • {visit.patient?.phone}
            {visit.chiefComplaint && ` • "${visit.chiefComplaint}"`}
          </div>
        </div>

        {/* Time & action */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
            {timeStr}
          </div>
          {action && (
            <button
              className="btn btn-sm"
              style={{ background: `${action.color}22`, border: `1px solid ${action.color}44`, color: action.color, fontSize: '0.75rem' }}
              onClick={(e) => { e.stopPropagation(); onStatusChange(action.next); }}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
