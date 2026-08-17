import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider }        from '@tanstack/react-query';
import { Toaster }                                 from 'react-hot-toast';
import { AuthProvider }                            from './context/AuthContext';
import { SocketProvider }                          from './context/SocketContext';
import RoleLayout                                  from './layouts/RoleLayout';

// Public pages
import Home            from './pages/Home';
import Login           from './pages/Login';
import PatientRegister from './pages/PatientRegister';

// Admin pages
import AdminDashboard   from './pages/Admin/Dashboard';
import AdminDoctors     from './pages/Admin/Doctors';
import AdminRooms       from './pages/Admin/Rooms';
import AdminDepartments from './pages/Admin/Departments';
import AdminStaff       from './pages/Admin/Staff';
import AdminAnalytics   from './pages/Admin/Analytics';

// Receptionist pages
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import TicketCreate          from './pages/Receptionist/TicketCreate';
import PrescriptionHandoff   from './pages/Receptionist/PrescriptionHandoff';

// Doctor pages
import DoctorDashboard from './pages/Doctor/Dashboard';

// Patient pages
import PatientPortal    from './pages/Patient/Portal';
import BookAppointment  from './pages/Patient/BookAppointment';

// Shared pages
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<PatientRegister />} />

      {/* Admin */}
      <Route element={<RoleLayout allowedRoles={['admin']} />}>
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/doctors"      element={<AdminDoctors />} />
        <Route path="/admin/rooms"        element={<AdminRooms />} />
        <Route path="/admin/departments"  element={<AdminDepartments />} />
        <Route path="/admin/staff"        element={<AdminStaff />} />
        <Route path="/admin/analytics"    element={<AdminAnalytics />} />
      </Route>

      {/* Receptionist */}
      <Route element={<RoleLayout allowedRoles={['receptionist']} />}>
        <Route path="/receptionist"                element={<ReceptionistDashboard />} />
        <Route path="/receptionist/new-ticket"     element={<TicketCreate />} />
        <Route path="/receptionist/queue"          element={<ReceptionistDashboard />} />
        <Route path="/receptionist/prescriptions"  element={<PrescriptionHandoff />} />
      </Route>

      {/* Doctor */}
      <Route element={<RoleLayout allowedRoles={['doctor']} />}>
        <Route path="/doctor"         element={<DoctorDashboard />} />
        <Route path="/doctor/history" element={<PatientPortal />} />
      </Route>

      {/* Patient */}
      <Route element={<RoleLayout allowedRoles={['patient']} />}>
        <Route path="/patient"         element={<PatientPortal />} />
        <Route path="/patient/book"    element={<BookAppointment />} />
        <Route path="/patient/history" element={<PatientPortal />} />
      </Route>

      {/* Settings — shared across all authenticated roles */}
      <Route element={<RoleLayout />}>
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A2236',
                  color:      '#E2E8F0',
                  border:     '1px solid rgba(99,179,237,0.2)',
                  borderRadius: 10,
                  fontSize: '0.875rem',
                },
                success: { iconTheme: { primary: '#0D9488', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
