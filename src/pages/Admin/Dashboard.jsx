import { useQuery } from '@tanstack/react-query';
import { analyticsApi, visitApi } from '../../api';
import Topbar from '../../components/Topbar';
import { StatCard, PageLoader } from '../../components/UI';
import StatusBadge from '../../components/StatusBadge';
import {
  Users, DoorOpen, ClipboardList, CheckCircle2,
  Stethoscope, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { data: overview, isLoading: ovLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn:  () => analyticsApi.getOverview().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: doctorLoad } = useQuery({
    queryKey: ['analytics-doctor-load'],
    queryFn:  () => analyticsApi.getDoctorLoad().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: trend } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn:  () => analyticsApi.getVisitTrend().then((r) => r.data.data),
  });

  const { data: deptStats } = useQuery({
    queryKey: ['analytics-dept'],
    queryFn:  () => analyticsApi.getDepartmentStats().then((r) => r.data.data),
  });

  if (ovLoading) return <PageLoader />;

  return (
    <div className="animate-fadeIn">
      <Topbar title="Admin Dashboard" subtitle="VisionCare Eye Hospital — Overview" />

      <div style={{ padding: '1.5rem' }}>
        {/* Stat cards */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatCard label="Today's Patients"   value={overview?.todayVisits}  icon={ClipboardList} color="#0D9488" sub="Walk-in + online" />
          <StatCard label="This Month"         value={overview?.monthVisits}  icon={Activity}      color="#6366F1" />
          <StatCard label="Total Patients"     value={overview?.totalPatients}icon={Users}         color="#F59E0B" sub="All time" />
          <StatCard label="Active Doctors"     value={overview?.activeDoctors}icon={Stethoscope}   color="#10B981" sub={`${overview?.activeRooms} rooms occupied`} />
        </div>

        <div className="grid-charts">
          {/* Visit trend */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontFamily: 'Outfit' }}>30-Day Visit Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Visits" stroke="#0D9488" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Dept stats */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Department Load (This Month)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(deptStats || []).map((d) => ({ name: d.department?.name || 'Unknown', total: d.total, completed: d.completed }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total" fill="#6366F1" radius={[4,4,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="#0D9488" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor load table */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Doctor Queue Status</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Room</th>
                  <th>Active Patients</th>
                  <th>Today Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(doctorLoad || []).map((d) => (
                  <tr key={d.doctor._id}>
                    <td style={{ fontWeight: 500 }}>{d.doctor.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{d.doctor.department?.name || '—'}</td>
                    <td>
                      {d.room
                        ? <span style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 6, padding: '2px 8px', fontSize: '0.8125rem', color: 'var(--color-teal-light)' }}>Room {d.room}</span>
                        : <span style={{ color: 'var(--color-text-dim)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: d.activeCount > 3 ? 'var(--color-warning)' : 'var(--color-text)' }}>{d.activeCount}</span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{d.todayCount}</td>
                    <td><StatusBadge status={d.doctor.isAvailable ? 'available' : 'unavailable'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
