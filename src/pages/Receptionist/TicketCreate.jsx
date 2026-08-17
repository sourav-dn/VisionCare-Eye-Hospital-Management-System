import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { patientApi, visitApi } from '../../api';
import { publicApi } from '../../api';
import Topbar from '../../components/Topbar';
import { Search, UserPlus, Check, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Find Patient', 'Patient Details', 'Select Department', 'Confirm'];

export default function TicketCreate() {
  const navigate = useNavigate();
  const [step,        setStep]       = useState(0);
  const [phone,       setPhone]      = useState('');
  const [patient,     setPatient]    = useState(null);
  const [isNew,       setIsNew]      = useState(false);
  const [deptId,      setDeptId]     = useState('');
  const [complaint,   setComplaint]  = useState('');
  const [newPatient,  setNewPatient] = useState({ name: '', age: '', gender: '', address: '', allergies: '', chronicConditions: '' });

  const set = (k) => (e) => setNewPatient((f) => ({ ...f, [k]: e.target.value }));

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => publicApi.getDepartments().then((r) => r.data.data) });

  const searchMut = useMutation({
    mutationFn: () => patientApi.search({ phone }).then((r) => r.data),
    onSuccess: (data) => {
      if (data.count > 0) { setPatient(data.data[0]); setIsNew(false); setStep(2); }
      else                { setIsNew(true); setStep(1); }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Search failed'),
  });

  const createPatientMut = useMutation({
    mutationFn: () => patientApi.create({
      ...newPatient,
      age: Number(newPatient.age),
      phone,
      allergies:         newPatient.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      chronicConditions: newPatient.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
    }),
    onSuccess: (res) => { setPatient(res.data.data); setStep(2); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to register patient'),
  });

  const createTicketMut = useMutation({
    mutationFn: () => visitApi.create({ patientId: patient._id, departmentId: deptId, bookingType: 'walk-in', chiefComplaint: complaint }),
    onSuccess: (res) => {
      toast.success(`Ticket ${res.data.data.ticketNumber} created!`);
      navigate('/receptionist');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Ticket creation failed'),
  });

  const selectedDept = (departments || []).find((d) => d._id === deptId);

  return (
    <div className="animate-fadeIn">
      <Topbar title="Create New Ticket" subtitle="Walk-in patient registration" />
      <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0.25rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: i < step ? 'var(--color-teal)' : i === step ? 'var(--color-teal-glow)' : 'var(--color-surface-3)',
                border: `2px solid ${i <= step ? 'var(--color-teal)' : 'var(--color-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i < step ? '#fff' : i === step ? 'var(--color-teal-light)' : 'var(--color-text-dim)',
                fontSize: '0.8125rem', fontWeight: 700,
              }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <div style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: i === step ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap' }}>
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--color-teal)' : 'var(--color-border)', margin: '0 0.75rem', borderRadius: 2 }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Phone Search */}
        {step === 0 && (
          <div className="card animate-slideUp">
            <h3 style={{ margin: '0 0 0.375rem', fontFamily: 'Outfit' }}>Search Patient by Phone</h3>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Enter the patient's phone number to find existing records or register a new patient.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input id="phone-search" className="input" style={{ flex: 1 }} type="tel" placeholder="01XXXXXXXXX"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && phone && searchMut.mutate()} />
              <button id="search-btn" className="btn btn-primary" disabled={!phone || searchMut.isPending} onClick={() => searchMut.mutate()}>
                {searchMut.isPending ? 'Searching...' : <><Search size={16} /> Search</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Register New Patient */}
        {step === 1 && isNew && (
          <div className="card animate-slideUp">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontFamily: 'Outfit' }}>Register New Patient</h3>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>No patient found for {phone}. Fill in the details below.</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}><X size={16} /></button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Full Name *</label><input className="input" value={newPatient.name} onChange={set('name')} required placeholder="Patient's full name" /></div>
              <div className="form-group"><label className="label">Phone</label><input className="input" value={phone} disabled style={{ opacity: 0.7 }} /></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Age *</label><input className="input" type="number" value={newPatient.age} onChange={set('age')} required placeholder="Age" min={0} max={150} /></div>
              <div className="form-group">
                <label className="label">Gender *</label>
                <select className="input" value={newPatient.gender} onChange={set('gender')} required>
                  <option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="label">Address</label><input className="input" value={newPatient.address} onChange={set('address')} placeholder="Patient's address" /></div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Allergies</label><input className="input" value={newPatient.allergies} onChange={set('allergies')} placeholder="Comma-separated (e.g. Penicillin, Aspirin)" /></div>
              <div className="form-group"><label className="label">Chronic Conditions</label><input className="input" value={newPatient.chronicConditions} onChange={set('chronicConditions')} placeholder="Comma-separated (e.g. Diabetes, HTN)" /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
              <button className="btn btn-primary" disabled={!newPatient.name || !newPatient.age || !newPatient.gender || createPatientMut.isPending} onClick={() => createPatientMut.mutate()}>
                <UserPlus size={16} /> {createPatientMut.isPending ? 'Registering...' : 'Register & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Department */}
        {step === 2 && patient && (
          <div className="animate-slideUp">
            {/* Patient confirmation card */}
            <div className="card" style={{ marginBottom: '1rem', background: 'rgba(13,148,136,0.05)', borderColor: 'rgba(13,148,136,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-teal-light)', flexShrink: 0 }}>
                  {patient.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{patient.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{patient.phone} • {patient.age} yrs • {patient.gender} • ID: {patient.patientId}</div>
                </div>
                <Check size={18} color="var(--color-success)" style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontFamily: 'Outfit' }}>Select Department</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {(departments || []).map((d) => (
                  <button key={d._id} onClick={() => setDeptId(d._id)}
                    style={{
                      padding: '0.875rem', borderRadius: 10, border: `2px solid ${deptId === d._id ? 'var(--color-teal)' : 'var(--color-border)'}`,
                      background: deptId === d._id ? 'var(--color-teal-glow)' : 'var(--color-surface-3)',
                      color: deptId === d._id ? 'var(--color-teal-light)' : 'var(--color-text)', cursor: 'pointer',
                      fontWeight: deptId === d._id ? 700 : 400, fontSize: '0.875rem', transition: 'all 0.15s', textAlign: 'center',
                    }}>
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="label">Chief Complaint (optional)</label>
                <textarea className="input" value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Reason for visit..." style={{ minHeight: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
                <button className="btn btn-primary" disabled={!deptId} onClick={() => setStep(3)}>
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && patient && (
          <div className="card animate-slideUp">
            <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'Outfit' }}>Confirm Ticket</h3>
            <div style={{ background: 'var(--color-surface-3)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                {[
                  ['Patient', patient.name],
                  ['Phone', patient.phone],
                  ['Patient ID', patient.patientId],
                  ['Department', selectedDept?.name || '—'],
                  ['Booking Type', 'Walk-in'],
                  ['Chief Complaint', complaint || 'Not specified'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{label}</div>
                    <div style={{ fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              The system will automatically assign the least-busy available doctor in <strong>{selectedDept?.name}</strong> and attach their current room to this ticket.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button id="create-ticket-btn" className="btn btn-primary btn-lg" disabled={createTicketMut.isPending} onClick={() => createTicketMut.mutate()}>
                {createTicketMut.isPending ? 'Creating...' : '✓ Create Ticket'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
