import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { visitApi } from '../../api';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { StatCard, PageLoader } from '../../components/UI';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, Ticket, Plus } from 'lucide-react';

export default function ReceptionistDashboard() {
  const { on, off } = useSocket() || {};
  const [liveUpdates, setLiveUpdates] = useState(0);

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

  // Live socket updates
  useEffect(() => {
    if (!on) return;
    const handler = () => { refetchVisits(); refetchStats(); setLiveUpdates((n) => n + 1); };
    on('queue-update', handler);
    return () => off?.('queue-update', handler);
  }, [on, off, refetchVisits, refetchStats]);

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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/receptionist/new-ticket" className="btn btn-primary btn-lg">
            <Plus size={18} /> New Ticket
          </Link>
          <Link to="/receptionist/prescriptions" className="btn btn-secondary btn-lg">
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
                <thead><tr><th>#</th><th>Ticket</th><th>Patient</th><th>Department</th><th>Doctor</th><th>Room</th><th>Status</th><th>Time</th></tr></thead>
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
                      <td style={{ fontSize: '0.875rem' }}>{v.assignedDoctor?.name || '—'}</td>
                      <td>
                        {v.roomNumber
                          ? <span style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 6, padding: '2px 8px', fontSize: '0.8125rem', color: 'var(--color-teal-light)' }}>Rm {v.roomNumber}</span>
                          : <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8125rem' }}>—</span>}
                      </td>
                      <td><StatusBadge status={v.status} /></td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {new Date(v.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
