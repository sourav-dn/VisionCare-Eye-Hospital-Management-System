import { useQuery } from '@tanstack/react-query';
import { patientApi, visitApi } from '../../api';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { PageLoader } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, FileText, History, ExternalLink } from 'lucide-react';

const STATUS_STEPS = ['scheduled', 'waiting', 'in-consultation', 'in-procedure', 'ready-for-prescription', 'completed'];

function TicketTracker({ status }) {
  const current = STATUS_STEPS.indexOf(status);
  if (status === 'cancelled') return <div className="alert alert-danger" style={{ fontSize: '0.8125rem' }}>This visit was cancelled</div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      {STATUS_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const labels = ['Scheduled', 'Waiting', 'With Doctor', 'Procedure', 'Ready', 'Done'];
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
              background: done ? 'var(--color-teal)' : active ? 'var(--color-teal-glow)' : 'var(--color-surface-3)',
              color: done ? '#fff' : active ? 'var(--color-teal-light)' : 'var(--color-text-dim)',
              border: `1px solid ${done || active ? 'var(--color-teal)' : 'var(--color-border)'}`,
            }}>
              {done ? '✓' : ''} {labels[i]}
            </div>
            {i < STATUS_STEPS.length - 1 && <div style={{ width: 16, height: 2, background: done ? 'var(--color-teal)' : 'var(--color-border)', margin: '0 1px' }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function PatientPortal() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-history'],
    queryFn: () => patientApi.getMyHistory().then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;

  const patient = data?.patient;
  const visits = data?.visits || [];
  const latest = visits[0];
  const isActive = latest && !['completed', 'cancelled'].includes(latest.status);

  return (
    <div className="animate-fadeIn">
      <Topbar title="My Portal" subtitle="View your appointments and visit history" />
      <div style={{ padding: '1.5rem' }}>

        {/* Patient card */}
        {patient && (
          <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(13,148,136,0.06), rgba(99,102,241,0.04))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-teal-glow)', border: '2px solid var(--color-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-teal-light)', flexShrink: 0 }}>
                {patient.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'Outfit' }}>{patient.name}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.125rem' }}>
                  {patient.age} yrs • {patient.gender} • {patient.phone} • ID: {patient.patientId}
                </div>
                {patient.allergies?.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '0.25rem' }}>⚠️ Allergies: {patient.allergies.join(', ')}</div>
                )}
              </div>
              <Link to="/patient/book" className="btn btn-primary"><Calendar size={15} /> Book Appointment</Link>
            </div>
          </div>
        )}

        {/* Active visit tracker */}
        {isActive && (
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(13,148,136,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="live-dot" />
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontFamily: 'Outfit' }}>Active Visit</h3>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'var(--color-surface-3)', borderRadius: 4, padding: '1px 6px', color: 'var(--color-text-muted)' }}>{latest.ticketNumber}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {latest.department?.name} • {latest.assignedDoctor?.name || 'Being assigned'} • Room {latest.roomNumber || '—'}
            </div>
            <TicketTracker status={latest.status} />
          </div>
        )}

        {/* Visit history */}
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontFamily: 'Outfit' }}>Visit History ({visits.length})</h2>

        {!visits.length ? (
          <div className="alert alert-info">No visits yet. <Link to="/patient/book" style={{ color: 'var(--color-teal-light)' }}>Book your first appointment →</Link></div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {visits.map((v) => (
              <div key={v._id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', background: 'var(--color-surface-3)', borderRadius: 4, padding: '2px 6px', color: 'var(--color-text-muted)' }}>{v.ticketNumber}</span>
                      <StatusBadge status={v.status} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                        {new Date(v.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {v.department?.name} • {v.assignedDoctor?.name || '—'} • Room {v.roomNumber || '—'}
                    </div>
                    {v.diagnosis && (
                      <div style={{ marginTop: '0.375rem', fontSize: '0.875rem' }}>
                        <strong style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Diagnosis: </strong>{v.diagnosis}
                      </div>
                    )}
                    {v.medicines?.length > 0 && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        💊 {v.medicines.map((m) => m.name).join(', ')}
                      </div>
                    )}
                  </div>
                  {v.prescriptionUrl && (
                    <a href={v.prescriptionUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                      <ExternalLink size={13} /> Prescription
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
