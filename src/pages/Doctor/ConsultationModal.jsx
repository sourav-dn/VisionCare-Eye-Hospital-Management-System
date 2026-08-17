import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '../../api';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { PageLoader } from '../../components/UI';
import { Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TRANSITIONS = {
  waiting:                  ['in-consultation', 'cancelled'],
  'in-consultation':        ['in-procedure', 'ready-for-prescription', 'cancelled'],
  'in-procedure':           ['in-consultation', 'ready-for-prescription'],
  'ready-for-prescription': [],
  scheduled:                ['waiting', 'cancelled'],
  completed:                [],
  cancelled:                [],
};

const EMPTY_MED  = { name: '', dosage: '', duration: '', timing: '', notes: '' };
const EMPTY_TEST = { name: '', result: '', reportUrl: '' };

export default function ConsultationModal({ visitId, onClose }) {
  const qc = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['visit-detail', visitId],
    queryFn:  () => visitApi.getById(visitId).then((r) => r.data),
  });

  const [form, setForm] = useState(null);

  // Initialize form from visit data
  if (data?.data && !form) {
    setForm({
      chiefComplaint: data.data.chiefComplaint || '',
      diagnosis:      data.data.diagnosis      || '',
      doctorNotes:    data.data.doctorNotes    || '',
      nextVisitDate:  data.data.nextVisitDate ? new Date(data.data.nextVisitDate).toISOString().slice(0, 10) : '',
      medicines:      data.data.medicines?.length ? [...data.data.medicines] : [{ ...EMPTY_MED }],
      testsAdvised:   data.data.testsAdvised?.length ? [...data.data.testsAdvised] : [],
    });
  }

  const saveMut = useMutation({
    mutationFn: () => visitApi.updateConsultation(visitId, { ...form, nextVisitDate: form.nextVisitDate || undefined }),
    onSuccess: () => { qc.invalidateQueries(['doctor-queue', 'visit-detail']); toast.success('Consultation saved'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const statusMut = useMutation({
    mutationFn: (status) => visitApi.updateStatus(visitId, { status }),
    onSuccess: () => { qc.invalidateQueries(['doctor-queue', 'visit-detail']); toast.success('Status updated'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading || !form) return <Modal isOpen title="Loading..." onClose={onClose}><PageLoader /></Modal>;

  const visit   = data.data;
  const patient = visit.patient;
  const history = data.history || [];

  const addMed  = () => setForm((f) => ({ ...f, medicines:   [...f.medicines,   { ...EMPTY_MED  }] }));
  const addTest = () => setForm((f) => ({ ...f, testsAdvised:[...f.testsAdvised,{ ...EMPTY_TEST }] }));
  const removeMed  = (i) => setForm((f) => ({ ...f, medicines:    f.medicines.filter((_, j) => j !== i) }));
  const removeTest = (i) => setForm((f) => ({ ...f, testsAdvised: f.testsAdvised.filter((_, j) => j !== i) }));

  const setMed  = (i, k) => (e) => setForm((f) => { const m = [...f.medicines];    m[i] = { ...m[i],   [k]: e.target.value }; return { ...f, medicines:    m }; });
  const setTest = (i, k) => (e) => setForm((f) => { const t = [...f.testsAdvised]; t[i] = { ...t[i],   [k]: e.target.value }; return { ...f, testsAdvised: t }; });

  const allowedNext = STATUS_TRANSITIONS[visit.status] || [];

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, overflowY: 'auto', alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)', borderRadius: 16, padding: '0', width: '100%', maxWidth: 900, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'var(--color-navy)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.125rem' }}>{patient?.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {patient?.age} yrs • {patient?.phone} • ID: {patient?.patientId} • Ticket: {visit.ticketNumber}
              </div>
            </div>
            <StatusBadge status={visit.status} />
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 500 }}>
          {/* Left: Consultation form */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 700 }}>

            {/* Allergies / chronic conditions banner */}
            {(patient?.allergies?.length > 0 || patient?.chronicConditions?.length > 0) && (
              <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
                {patient.allergies?.length > 0 && <div>⚠️ <strong>Allergies:</strong> {patient.allergies.join(', ')}</div>}
                {patient.chronicConditions?.length > 0 && <div>🩺 <strong>Chronic:</strong> {patient.chronicConditions.join(', ')}</div>}
              </div>
            )}

            {/* Chief complaint */}
            <div className="form-group">
              <label className="label">Chief Complaint</label>
              <input className="input" value={form.chiefComplaint} onChange={(e) => setForm((f) => ({ ...f, chiefComplaint: e.target.value }))} placeholder="Reason for visit..." />
            </div>

            {/* Diagnosis */}
            <div className="form-group">
              <label className="label">Diagnosis *</label>
              <textarea className="input" value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} placeholder="Enter diagnosis..." style={{ minHeight: 70 }} />
            </div>

            {/* Medicines */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <label className="label" style={{ margin: 0 }}>Prescribed Medicines</label>
                <button className="btn btn-ghost btn-sm" onClick={addMed}><Plus size={13} /> Add</button>
              </div>
              {form.medicines.map((med, i) => (
                <div key={i} style={{ background: 'var(--color-surface-3)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input className="input" placeholder="Medicine name" value={med.name}     onChange={setMed(i, 'name')}     style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                    <input className="input" placeholder="Dosage (e.g. 500mg)" value={med.dosage}  onChange={setMed(i, 'dosage')}  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                    <input className="input" placeholder="Duration" value={med.duration} onChange={setMed(i, 'duration')} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem' }}>
                    <input className="input" placeholder="Timing (e.g. 1-0-1 after meals)" value={med.timing} onChange={setMed(i, 'timing')} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                    <input className="input" placeholder="Notes" value={med.notes}  onChange={setMed(i, 'notes')}  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                    <button onClick={() => removeMed(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)', padding: '0.5rem' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tests */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <label className="label" style={{ margin: 0 }}>Tests / Procedures Advised</label>
                <button className="btn btn-ghost btn-sm" onClick={addTest}><Plus size={13} /> Add</button>
              </div>
              {form.testsAdvised.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input className="input" placeholder="Test name" value={t.name} onChange={setTest(i, 'name')} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                  <input className="input" placeholder="Result / notes" value={t.result} onChange={setTest(i, 'result')} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }} />
                  <button onClick={() => removeTest(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)', padding: '0.5rem' }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            {/* Notes & next visit */}
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Doctor's Notes</label>
                <textarea className="input" value={form.doctorNotes} onChange={(e) => setForm((f) => ({ ...f, doctorNotes: e.target.value }))} placeholder="Additional notes..." style={{ minHeight: 60 }} />
              </div>
              <div className="form-group">
                <label className="label">Next Visit Date</label>
                <input className="input" type="date" value={form.nextVisitDate} onChange={(e) => setForm((f) => ({ ...f, nextVisitDate: e.target.value }))} />
              </div>
            </div>

            {/* Save + status transitions */}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                {saveMut.isPending ? 'Saving...' : '💾 Save Draft'}
              </button>
              {allowedNext.map((s) => {
                const labels = {
                  'in-consultation':         'Start Consultation',
                  'in-procedure':            'Send to Procedure',
                  'ready-for-prescription':  '✓ Ready for Prescription',
                  cancelled:                 'Cancel Visit',
                  waiting:                   'Move to Waiting',
                };
                const isFinalize = s === 'ready-for-prescription';
                return (
                  <button key={s} onClick={() => { saveMut.mutate(); setTimeout(() => statusMut.mutate(s), 500); }}
                    className={`btn ${isFinalize ? 'btn-primary' : s === 'cancelled' ? 'btn-danger' : 'btn-secondary'}`}
                    disabled={statusMut.isPending || saveMut.isPending}>
                    {labels[s] || s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Patient history sidebar */}
          <div style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)', overflowY: 'auto', maxHeight: 700 }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <button onClick={() => setShowHistory(!showHistory)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.875rem', width: '100%' }}>
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Past Visits ({history.length})
              </button>
            </div>

            {(showHistory || history.length > 0) && (
              <div style={{ padding: '0.75rem' }}>
                {!history.length ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1rem' }}>First visit — no history</p>
                ) : (
                  history.map((h) => (
                    <div key={h._id} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '0.875rem', marginBottom: '0.75rem', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{h.ticketNumber}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{h.department?.name}</div>
                      {h.diagnosis && <div style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}><strong>Dx:</strong> {h.diagnosis}</div>}
                      {h.medicines?.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          💊 {h.medicines.map((m) => m.name).join(', ')}
                        </div>
                      )}
                      {h.prescriptionUrl && (
                        <a href={h.prescriptionUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--color-teal-light)', marginTop: '0.375rem', textDecoration: 'none' }}>
                          <ExternalLink size={10} /> View Prescription
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
