import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { PageLoader } from '../../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function AdminAnalytics() {
  const { data: overview }        = useQuery({ queryKey: ['analytics-overview'],   queryFn: () => analyticsApi.getOverview().then((r) => r.data.data) });
  const { data: trend, isLoading }= useQuery({ queryKey: ['analytics-trend'],      queryFn: () => analyticsApi.getVisitTrend().then((r) => r.data.data) });
  const { data: deptStats }       = useQuery({ queryKey: ['analytics-dept'],       queryFn: () => analyticsApi.getDepartmentStats().then((r) => r.data.data) });
  const { data: roomUtil }        = useQuery({ queryKey: ['analytics-rooms'],      queryFn: () => analyticsApi.getRoomUtilization().then((r) => r.data.data) });
  const { data: doctorLoad }      = useQuery({ queryKey: ['analytics-doctor-load'],queryFn: () => analyticsApi.getDoctorLoad().then((r) => r.data.data) });

  if (isLoading) return <PageLoader />;

  const pieData = (deptStats || []).map((d) => ({ name: d.department?.name || 'Unknown', value: d.total }));
  const trendData = (trend || []).map((t) => ({ date: t._id.slice(5), count: t.count }));
  const barData   = (doctorLoad || []).map((d) => ({ name: d.doctor.name.replace('Dr. ', ''), today: d.todayCount, active: d.activeCount }));

  return (
    <div className="animate-fadeIn">
      <Topbar title="Analytics" subtitle="Hospital performance overview" />
      <div style={{ padding: '1.5rem' }}>

        {/* Trend */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Visit Trend — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Visits" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3, fill: '#0D9488' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          {/* Dept pie */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Department Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor bar */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Doctor Load Today</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                <Bar dataKey="today"  name="Today Total" fill="#6366F1" radius={[3,3,0,0]} />
                <Bar dataKey="active" name="Active Now"  fill="#0D9488" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room utilization */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontFamily: 'Outfit' }}>Room Utilization</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Room</th><th>Department</th><th>Assigned Doctor</th><th>Status</th><th>Active Patients</th></tr></thead>
              <tbody>
                {(roomUtil || []).map(({ room, activeVisits }) => (
                  <tr key={room._id}>
                    <td><span style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 6, padding: '2px 8px', fontWeight: 700, color: 'var(--color-teal-light)', fontSize: '0.8125rem' }}>Room {room.roomNumber}</span></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{room.department?.name}</td>
                    <td>{room.assignedDoctor?.name || <span style={{ color: 'var(--color-text-dim)' }}>Unassigned</span>}</td>
                    <td><StatusBadge status={room.status} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ height: 6, width: `${Math.min(activeVisits * 20, 100)}%`, minWidth: 4, maxWidth: 80, background: activeVisits > 3 ? 'var(--color-danger)' : 'var(--color-teal)', borderRadius: 3 }} />
                        <span style={{ fontWeight: 600, color: activeVisits > 3 ? 'var(--color-warning)' : 'var(--color-text)' }}>{activeVisits}</span>
                      </div>
                    </td>
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
