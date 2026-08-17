import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi, visitApi, patientApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../../components/Topbar';
import { Calendar, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [deptId,      setDeptId]      = useState('');
  const [apptDate,    setApptDate]    = useState('');
  const [apptTime,    setApptTime]    = useState('09:00');
  const [complaint,   setComplaint]   = useState('');

  const { data: departments } = useQuery({
    queryKey: ['public-departments'],
    queryFn:  () => publicApi.getDepartments().then((r) => r.data.data),
  });

  const { data: patientData } = useQuery({
    queryKey: ['my-history'],
    queryFn:  () => patientApi.getMyHistory().then((r) => r.data),
  });

  const bookMut = useMutation({
    mutationFn: () => {
      if (!patientData?.patient) throw new Error('No patient profile linked to your account');
      const appointmentDate = new Date(`${apptDate}T${apptTime}:00`);
      return visitApi.create({
        patientId:       patientData.patient._id,
        departmentId:    deptId,
        bookingType:     'online',
        appointmentDate: appointmentDate.toISOString(),
        chiefComplaint:  complaint,
      });
    },
    onSuccess: (res) => {
      toast.success(`Appointment booked! Ticket: ${res.data.data.ticketNumber}`);
      navigate('/patient');
    },
    onError: (e) => toast.error(e.response?.data?.message || e.message || 'Booking failed'),
  });

  const selectedDept = (departments || []).find((d) => d._id === deptId);

  // Minimum date = today
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="animate-fadeIn">
      <Topbar title="Book Appointment" subtitle="Schedule an appointment with a specialist" />
      <div style={{ padding: '1.5rem', maxWidth: 620, margin: '0 auto' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 1.5rem', fontFamily: 'Outfit', fontSize: '1.125rem' }}>
            <Calendar size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--color-teal-light)' }} />
            New Appointment
          </h3>

          {!patientData?.patient && (
            <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
              Your account doesn't have a linked patient profile yet. Please contact reception to register.
            </div>
          )}

          {/* Department */}
          <div className="form-group">
            <label className="label">Department / Specialty *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
              {(departments || []).map((d) => (
                <button key={d._id} onClick={() => setDeptId(d._id)}
                  style={{
                    padding: '0.75rem', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${deptId === d._id ? 'var(--color-teal)' : 'var(--color-border)'}`,
                    background: deptId === d._id ? 'var(--color-teal-glow)' : 'var(--color-surface-3)',
                    color: deptId === d._id ? 'var(--color-teal-light)' : 'var(--color-text)',
                    fontWeight: deptId === d._id ? 700 : 400, fontSize: '0.8125rem', transition: 'all 0.15s',
                  }}>
                  {deptId === d._id && <Check size={12} style={{ display: 'inline', marginRight: 4 }} />}
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date & time */}
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Preferred Date *</label>
              <input id="appt-date" className="input" type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} min={today} required />
            </div>
            <div className="form-group">
              <label className="label">Preferred Time</label>
              <select id="appt-time" className="input" value={apptTime} onChange={(e) => setApptTime(e.target.value)}>
                {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chief complaint */}
          <div className="form-group">
            <label className="label">Reason / Chief Complaint</label>
            <textarea id="appt-complaint" className="input" value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Briefly describe your symptoms or reason for visit..." style={{ minHeight: 80 }} />
          </div>

          {/* Summary */}
          {deptId && apptDate && (
            <div style={{ background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-teal-light)' }}>Appointment Summary</div>
              <div style={{ color: 'var(--color-text-muted)' }}>{selectedDept?.name} on {new Date(`${apptDate}T${apptTime}`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at {apptTime}</div>
            </div>
          )}

          <button
            id="book-btn"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={!deptId || !apptDate || !patientData?.patient || bookMut.isPending}
            onClick={() => bookMut.mutate()}
          >
            {bookMut.isPending ? 'Booking...' : '📅 Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
