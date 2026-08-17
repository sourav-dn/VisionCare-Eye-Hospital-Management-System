import api from './axios';

export const authApi = {
  login:           (data) => api.post('/auth/login', data),
  registerPatient: (data) => api.post('/auth/register-patient', data),
  registerStaff:   (data) => api.post('/auth/register-staff', data),
  getMe:           ()     => api.get('/auth/me'),
  changePassword:  (data) => api.put('/auth/change-password', data),
  updateProfile:   (data) => api.put('/auth/profile', data),
};

export const adminApi = {
  // Departments
  getDepartments:   ()        => api.get('/admin/departments'),
  createDepartment: (data)    => api.post('/admin/departments', data),
  updateDepartment: (id, data)=> api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id)      => api.delete(`/admin/departments/${id}`),

  // Doctors
  getDoctors:       (params)  => api.get('/admin/doctors', { params }),
  getDoctorById:    (id)      => api.get(`/admin/doctors/${id}`),
  createDoctor:     (data)    => api.post('/admin/doctors', data),
  updateDoctor:     (id, data)=> api.put(`/admin/doctors/${id}`, data),
  toggleAvailability: (id)    => api.patch(`/admin/doctors/${id}/toggle-availability`),
  deleteDoctor:     (id)      => api.delete(`/admin/doctors/${id}`),

  // Rooms
  getRooms:       (params)    => api.get('/admin/rooms', { params }),
  createRoom:     (data)      => api.post('/admin/rooms', data),
  updateRoom:     (id, data)  => api.put(`/admin/rooms/${id}`, data),
  deleteRoom:     (id)        => api.delete(`/admin/rooms/${id}`),
  assignDoctor:   (id, data)  => api.patch(`/admin/rooms/${id}/assign`, data),

  // Staff
  getStaff:     ()            => api.get('/admin/staff'),
  createStaff:  (data)        => api.post('/admin/staff', data),
  updateStaff:  (id, data)    => api.put(`/admin/staff/${id}`, data),
};

export const patientApi = {
  search:       (params) => api.get('/patients/search', { params }),
  getAll:       (params) => api.get('/patients', { params }),
  getById:      (id)     => api.get(`/patients/${id}`),
  create:       (data)   => api.post('/patients', data),
  update:       (id, data) => api.put(`/patients/${id}`, data),
  getMyHistory: ()       => api.get('/patients/my-history'),
};

export const visitApi = {
  create:       (data)     => api.post('/visits', data),
  getAll:       (params)   => api.get('/visits', { params }),
  getById:      (id)       => api.get(`/visits/${id}`),
  updateStatus: (id, data) => api.patch(`/visits/${id}/status`, data),
  updateConsultation: (id, data) => api.patch(`/visits/${id}/consultation`, data),
  reassignDoctor: (id, data) => api.patch(`/visits/${id}/assign-doctor`, data),
  getPrescription: (id)    => api.get(`/visits/${id}/prescription`),
  getTodayStats:   ()      => api.get('/visits/today/stats'),
};

export const analyticsApi = {
  getOverview:       () => api.get('/analytics/overview'),
  getDoctorLoad:     () => api.get('/analytics/doctor-load'),
  getDepartmentStats:() => api.get('/analytics/department-stats'),
  getRoomUtilization:() => api.get('/analytics/room-utilization'),
  getVisitTrend:     () => api.get('/analytics/visit-trend'),
};

export const publicApi = {
  getDepartments: () => api.get('/departments'),
  getDoctors:     () => api.get('/public/doctors'),
};
