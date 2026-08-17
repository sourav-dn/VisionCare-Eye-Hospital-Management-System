import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '../../api';
import Topbar from '../../components/Topbar';
import { PageLoader, EmptyState } from '../../components/UI';
import { FileText, Download, CheckCircle2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrescriptionHandoff() {
  const qc = useQueryClient();

  const { data: readyVisits, isLoading } = useQuery({
    queryKey: ['prescriptions-ready'],
    queryFn:  () => visitApi.getAll({ status: 'ready-for-prescription', limit: 100 }).then((r) => r.data.data),
    refetchInterval: 15000,
  });

  const { data: completedVisits } = useQuery({
    queryKey: ['prescriptions-completed'],
    queryFn:  () => visitApi.getAll({ status: 'completed', limit: 20 }).then((r) => r.data.data),
  });

  const completeMut = useMutation({
    mutationFn: (id) => visitApi.updateStatus(id, { status: 'completed' }),
    onSuccess: (_, id) => {
      qc.invalidateQueries(['prescriptions-ready', 'prescriptions-completed', 'receptionist-queue', 'today-stats']);
      toast.success('Visit completed — prescription generated');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const getPrescMut = useMutation({
    mutationFn: (id) => visitApi.getPrescription(id),
    onSuccess: (res) => {
      if (res.data.prescriptionUrl) {
        window.open(res.data.prescriptionUrl, '_blank');
      } else {
        toast.error('Prescription not yet available');
      }
    },
    onError: () => toast.error('Could not retrieve prescription'),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <Topbar title="Prescription Handoff" subtitle="Mark visits complete and hand out prescriptions" />
      <div style={{ padding: '1.5rem' }}>

        {/* Ready for prescription */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
            Ready for Prescription ({readyVisits?.length || 0})
          </h2>

          {!readyVisits?.length ? (
            <EmptyState icon={FileText} title="No visits ready" description="Visits will appear here once doctors mark them ready for prescription" />
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {readyVisits.map((v) => (
                <div key={v._id} className="card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Queue number */}
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#F59E0B', flexShrink: 0 }}>
                      Rx
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700 }}>{v.patient?.name}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'var(--color-surface-3)', borderRadius: 4, padding: '1px 5px', color: 'var(--color-text-muted)' }}>{v.ticketNumber}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {v.department?.name} • Dr. {v.assignedDoctor?.name} • Room {v.roomNumber || '—'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
                      <button className="btn btn-primary" onClick={() => completeMut.mutate(v._id)} disabled={completeMut.isPending}>
                        <CheckCircle2 size={15} /> Mark Complete & Generate PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently completed */}
        <div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontFamily: 'Outfit', color: 'var(--color-text-muted)' }}>
            Recently Completed
          </h2>
          {!completedVisits?.length ? (
            <div className="alert alert-info" style={{ fontSize: '0.8125rem' }}>No completed visits today</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Ticket</th><th>Patient</th><th>Doctor</th><th>Completed At</th><th>Prescription</th></tr></thead>
                <tbody>
                  {completedVisits.map((v) => (
                    <tr key={v._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', background: 'var(--color-surface-3)', borderRadius: 4, padding: '2px 6px' }}>{v.ticketNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{v.patient?.name}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{v.patient?.phone}</div>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{v.assignedDoctor?.name || '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {v.finalizedAt ? new Date(v.finalizedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td>
                        {v.prescriptionUrl ? (
                          <a href={v.prescriptionUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            <ExternalLink size={13} /> Open PDF
                          </a>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => getPrescMut.mutate(v._id)}>
                            <Download size={13} /> Generate
                          </button>
                        )}
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
