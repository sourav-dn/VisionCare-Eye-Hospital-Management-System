#  VisionCare Eye Hospital Management System

A full-stack MERN application for managing a single-branch eye hospital — patient registration, automated ticketing, real-time doctor queue, consultation workflow, and branded PDF prescription generation.

---

##  Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env — add your Cloudinary credentials

# Start development server
npm run dev

# (Optional) Seed database with test data
npm run seed
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend**: http://localhost:5173  
**Backend API**: http://localhost:5000


---

## 📋 Environment Variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/eye-hospital

JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

HOSPITAL_NAME=VisionCare Eye Hospital
HOSPITAL_LOGO_URL=https://res.cloudinary.com/...  # Set after uploading logo

CLIENT_URL=http://localhost:5173
```

---

## 🏗️ Architecture

```
├── backend/
│   ├── models/         # Mongoose schemas (User, Patient, Visit, Room, Department)
│   ├── controllers/    # Business logic (auth, admin, patient, visit, analytics)
│   ├── routes/         # Express routes with role-based guards
│   ├── middleware/     # JWT auth, role check, error handler
│   ├── utils/          # pdfGenerator.js, assignDoctor.js, uploadToCloudinary.js
│   ├── sockets/        # Socket.io event handlers
│   ├── uploads/        # Hospital logo (logo.png)
│   ├── config/         # db.js, cloudinary.js
│   ├── seed.js         # Database seeder
│   └── server.js       # Express + Socket.io entry point
│
└── frontend/
    ├── src/
    │   ├── api/        # Axios + all API calls
    │   ├── context/    # AuthContext, SocketContext
    │   ├── components/ # Sidebar, Topbar, Modal, StatusBadge, UI primitives
    │   ├── layouts/    # RoleLayout (protected route wrapper)
    │   └── pages/
    │       ├── Admin/        # Dashboard, Doctors, Rooms, Departments, Staff, Analytics
    │       ├── Doctor/       # Dashboard (live queue), ConsultationModal
    │       ├── Receptionist/ # Dashboard, TicketCreate (wizard), PrescriptionHandoff
    │       └── Patient/      # Portal, BookAppointment
    └── vite.config.js  # Proxy to backend
```

---

## 🔄 Visit Status Workflow

```
scheduled → waiting → in-consultation → in-procedure → ready-for-prescription → completed
                                                    ↘ (optional)             ↗
```

- **PDF generated** only when status reaches `completed`
- **PDF uploaded** to Cloudinary and URL stored in the Visit record

---

##  Real-Time Features (Socket.io)

| Event | Triggered When | Received By |
|-------|---------------|-------------|
| `new-ticket-assigned` | New ticket created | Doctor (personal room) |
| `queue-update` | Any status change | All connected clients |
| `ticket-status-changed` | Status updated | Assigned doctor |
| `doctor-availability-changed` | Doctor toggled | Receptionist room |

---

##  API Endpoints

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register-patient` | Public |
| POST | `/api/auth/register-staff` | Admin |
| GET | `/api/admin/doctors` | Admin |
| PATCH | `/api/admin/rooms/:id/assign` | Admin |
| GET | `/api/patients/search?phone=xxx` | Staff |
| POST | `/api/visits` | Receptionist/Patient |
| PATCH | `/api/visits/:id/consultation` | Doctor |
| PATCH | `/api/visits/:id/status` | Staff |
| GET | `/api/visits/:id/prescription` | All |
| GET | `/api/analytics/overview` | Admin |

---

##  PDF Prescription

Generated server-side using **pdfkit**:
- Hospital letterhead with logo
- Patient + doctor information cards
- Diagnosis section
- Medicines table (name, dosage, duration, timing)
- Tests/procedures with results
- Doctor notes and next visit date

PDFs are streamed directly to **Cloudinary** (no temp files) and the URL is stored on the Visit record.

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| State | TanStack React Query |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| PDF | pdfkit |
| Storage | Cloudinary |
| Charts | Recharts |
