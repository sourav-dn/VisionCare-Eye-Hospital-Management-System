import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Eye, Calendar, Stethoscope, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, Phone, MapPin, Sparkles,
  Building2, FileText, UserCheck, HeartPulse, ChevronRight,
  LogIn, UserPlus, Zap, Menu, X,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const navRef = useRef(null);

  const toggleMobileMenu = useCallback(() => {
    if (!mobileMenuOpen && navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setMenuTop(rect.bottom);
    }
    setMobileMenuOpen((v) => !v);
  }, [mobileMenuOpen]);

  // Fetch live doctors & departments
  const { data: doctors, isLoading: docsLoading } = useQuery({
    queryKey: ['public-doctors'],
    queryFn: () => publicApi.getDoctors().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: depts } = useQuery({
    queryKey: ['public-departments'],
    queryFn: () => publicApi.getDepartments().then((r) => r.data.data),
  });

  const filteredDoctors = (doctors || []).filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.department?._id === activeTab || doc.department?.name === activeTab;
  });

  const ROLE_HOME_ROUTES = {
    admin: '/admin',
    receptionist: '/receptionist',
    doctor: '/doctor',
    patient: '/patient',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ─── TOP EMERGENCY / ANNOUNCEMENT BAR ───────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #0F172A, #0D9488, #0F172A)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-available" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
            <span className="live-dot" style={{ width: 6, height: 6 }} /> Open Today
          </span>
          <span style={{ color: 'var(--color-text-muted)' }} className="hide-mobile">
            🏥 Single-Branch Excellence • Walk-In & Online Appointments Active
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Phone size={13} color="var(--color-teal-light)" /> +880 1711-000000
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="hide-mobile">
            <MapPin size={13} color="var(--color-teal-light)" /> Gulshan Ave, Dhaka
          </span>
        </div>
      </div>

      {/* ─── NAVIGATION BAR ─────────────────────────────────────────────── */}
      <nav ref={navRef} style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(17, 24, 39, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(13,148,136,0.08))',
            border: '1px solid rgba(13,148,136,0.4)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}>
            <Eye size={24} color="var(--color-teal-light)" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.125rem', color: '#E2E8F0', letterSpacing: '-0.02em' }}>
              VisionCare
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-teal-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }} className="hide-mobile">
              Eye Hospital & Laser Center
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="home-nav-links">
          <a href="#services" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-teal-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}>
            Specialties
          </a>
          <a href="#doctors" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-teal-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}>
            Doctors
          </a>
          <a href="#workflow" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-teal-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}>
            How It Works
          </a>
          <a href="#facilities" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--color-teal-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}>
            Facilities
          </a>
        </div>

        {/* Right: Auth CTA + mobile hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          {/* Desktop auth buttons */}
          <div className="home-nav-links" style={{ gap: '0.625rem' }}>
            {user ? (
              <Link to={ROLE_HOME_ROUTES[user.role] || '/'} className="btn btn-primary btn-sm">
                <UserCheck size={15} /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <LogIn size={14} /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <Calendar size={14} /> Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger — CSS .show-mobile makes it flex only on mobile */}
          <button
            className="hamburger-btn show-mobile"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown — position:fixed anchored below nav via measured top */}
        {mobileMenuOpen && (
          <div className="home-mobile-menu" style={{ top: menuTop }}>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Specialties</a>
            <a href="#doctors"  onClick={() => setMobileMenuOpen(false)}>Doctors &amp; Availability</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#facilities" onClick={() => setMobileMenuOpen(false)}>Facilities</a>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.375rem 0' }} />
            {user ? (
              <Link to={ROLE_HOME_ROUTES[user.role] || '/'} className="btn btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ justifyContent: 'center' }}>
                <UserCheck size={15} /> Go to Dashboard
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  <LogIn size={15} /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Calendar size={15} /> Book Now
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ─── HERO BANNER SECTION ───── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem) clamp(2.5rem, 6vw, 4rem)',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(13, 148, 136, 0.15) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 80%)',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 1rem', borderRadius: 30,
            background: 'rgba(13, 148, 136, 0.12)', border: '1px solid rgba(13, 148, 136, 0.3)',
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-teal-light)',
            marginBottom: '1.5rem',
          }}>
            <Sparkles size={14} /> Automated Queueing & Smart Doctor Allocation System
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontFamily: 'Outfit',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 1.25rem',
            background: 'linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Advanced Eye Care & Precision<br />
            <span style={{
              background: 'linear-gradient(135deg, #2DD4BF, #6366F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Vision Surgery
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            maxWidth: 720, margin: '0 auto 2.5rem',
            fontSize: '1.125rem', color: 'var(--color-text-muted)',
            lineHeight: 1.7, fontWeight: 400,
          }}>
            Experience world-class ophthalmic care with automated ticketing, real-time doctor room routing, and digital prescription handoffs at exit.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={user ? '/patient/book' : '/register'} className="btn btn-primary btn-lg">
              <Calendar size={18} /> Book Online Appointment
            </Link>
            <a href="#doctors" className="btn btn-secondary btn-lg">
              <Stethoscope size={18} /> View Live Doctor Queue
            </a>
          </div>

          {/* Key Stat Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginTop: '4rem',
          }}>
            {[
              { icon: Stethoscope, color: '#0D9488', title: '6 Specialist Doctors', desc: 'Cornea, Retina, Cataract & Glaucoma' },
              { icon: Zap, color: '#F59E0B', title: 'Automated Routing', desc: 'Instant least-busy doctor assignment' },
              { icon: DoorOpenIcon, color: '#6366F1', title: 'Dynamic Rooms', desc: 'Real-time room tracking per shift' },
              { icon: FileText, color: '#10B981', title: 'Digital Prescriptions', desc: 'Branded PDF generated at visit completion' },
            ].map((card, i) => (
              <div key={i} className="card" style={{ textAlign: 'left', background: 'rgba(26, 34, 54, 0.7)' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${card.color}22`, border: `1px solid ${card.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.875rem',
                }}>
                  <card.icon size={22} color={card.color} />
                </div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontFamily: 'Outfit' }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPECIALTY DEPARTMENTS SECTION ─────────────────────────────── */}
      <section id="services" style={{ padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 4vw, 2rem)', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-teal-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Specialized Care
            </span>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', margin: '0.5rem 0 0.75rem' }}>
              What We Offer at VisionCare
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', fontSize: '0.95rem' }}>
              Comprehensive sub-specialty clinics equipped with advanced diagnostic imaging and surgical technology.
            </p>
          </div>

          <div className="grid-3">
            {[
              {
                icon: '👁️', title: 'General Ophthalmology',
                desc: 'Comprehensive vision exams, refraction, dry eye management, and primary ocular care.',
                treatments: ['Refractive Error Assessment', 'Dry Eye Therapy', 'Routine Eye Screening'],
              },
              {
                icon: '🔬', title: 'Cornea & Refractive',
                desc: 'Diagnosis and treatment of corneal dystrophies, cross-linking, LASIK, and keratoplasty.',
                treatments: ['Custom LASIK', 'Corneal Collagen Cross-Linking', 'Keratoconus Care'],
              },
              {
                icon: '🩸', title: 'Retina & Vitreous',
                desc: 'Advanced care for diabetic retinopathy, macular degeneration, retinal detachments, and vitrectomy.',
                treatments: ['Diabetic Eye Care', 'Anti-VEGF Injections', 'Vitreoretinal Surgery'],
              },
              {
                icon: '🩺', title: 'Cataract & Lens Surgery',
                desc: 'Micro-incision phacoemulsification with premium monofocal, multifocal, and toric intraocular lens implantation.',
                treatments: ['Phacoemulsification', 'Premium IOL Implants', 'Post-Cataract YAG Laser'],
              },
              {
                icon: '🧬', title: 'Glaucoma Care',
                desc: 'Early intraocular pressure detection, computerized visual fields, laser trabeculoplasty, and shunt surgeries.',
                treatments: ['IOP Monitoring', 'Selective Laser Trabeculoplasty', 'Glaucoma Valve Surgery'],
              },
              {
                icon: '⚡', title: 'Emergency Eye Care',
                desc: 'Immediate treatment for trauma, sudden vision loss, chemical injuries, and foreign body removal.',
                treatments: ['Foreign Body Removal', 'Acute Glaucoma Relief', 'Ocular Trauma Repair'],
              },
            ].map((service, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{service.icon}</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontFamily: 'Outfit' }}>{service.title}</h3>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', flex: 1, lineHeight: 1.6 }}>
                  {service.desc}
                </p>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-teal-light)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Key Services:
                  </div>
                  {service.treatments.map((t, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      <CheckCircle2 size={13} color="var(--color-teal)" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE DOCTORS & AVAILABILITY SECTION ───────────────────────── */}
      <section id="doctors" style={{ padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-teal-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Our Medical Team
              </span>
              <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', margin: '0.375rem 0 0' }}>
                Doctors & Live Room Availability
              </h2>
            </div>

            {/* Department filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('all')}
                className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Doctors
              </button>
              {(depts || []).map((d) => (
                <button
                  key={d._id}
                  onClick={() => setActiveTab(d._id)}
                  className={`btn btn-sm ${activeTab === d._id ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {docsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading doctor availability...</div>
          ) : !filteredDoctors.length ? (
            <div className="alert alert-info">No doctors found in this department.</div>
          ) : (
            <div className="grid-3">
              {filteredDoctors.map((doc) => (
                <div key={doc._id} className="card" style={{ position: 'relative' }}>

                  {/* Doctor Top Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 52, height: 52,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(99,102,241,0.2))',
                      border: '2px solid var(--color-teal)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-teal-light)',
                      flexShrink: 0,
                    }}>
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontFamily: 'Outfit' }}>
                        {doc.name}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {doc.department?.name || 'Ophthalmology'}
                      </div>
                    </div>
                  </div>

                  {/* Room & Availability Status */}
                  <div style={{
                    background: 'var(--color-surface-3)',
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Assigned Room
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: doc.currentRoom ? 'var(--color-teal-light)' : 'var(--color-text-muted)' }}>
                        {doc.currentRoom ? `Room ${doc.currentRoom}` : 'Unassigned'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                        Status
                      </div>
                      <StatusBadge status={doc.isAvailable ? 'available' : 'unavailable'} />
                    </div>
                  </div>

                  {/* Book Button */}
                  <Link
                    to={user ? '/patient/book' : '/register'}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={15} /> Book Consultation
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS (AUTOMATED QUEUE WORKFLOW) ───────────────────── */}
      <section id="workflow" style={{ padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 4vw, 2rem)', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-teal-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Patient Journey
            </span>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', margin: '0.5rem 0 0.75rem' }}>
              Automated Hospital Ticketing Workflow
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', fontSize: '0.95rem' }}>
              Our smart routing system assigns you to the available doctor with the shortest queue.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {[
              { num: '01', title: 'Registration / Search', desc: 'Walk in via phone search at reception or book online via your patient account.' },
              { num: '02', title: 'Auto Doctor Assignment', desc: 'The system checks live department loads and assigns the least-busy available doctor.' },
              { num: '03', title: 'Dynamic Room Routing', desc: 'Your ticket is attached to the doctor\'s currently allocated room number automatically.' },
              { num: '04', title: 'Digital Prescription PDF', desc: 'Once visit is completed, a hospital-branded PDF is generated and printed at exit.' },
            ].map((step, i) => (
              <div key={i} className="card" style={{ background: 'var(--color-surface-2)', borderTop: '3px solid var(--color-teal)' }}>
                <div style={{
                  fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800,
                  color: 'var(--color-teal-glow)', lineHeight: 1, marginBottom: '0.75rem',
                  WebkitTextStroke: '1px var(--color-teal)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontFamily: 'Outfit' }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FACILITIES & WHY CHOOSE US ───────────────────────────────── */}
      <section id="facilities" style={{ padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-teal-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                State-of-the-Art Hospital
              </span>
              <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', margin: '0.5rem 0 1.25rem', lineHeight: 1.25 }}>
                Why Patients Trust VisionCare Eye Hospital
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                We combine sub-specialty medical expertise with modern automated healthcare technology to eliminate long waiting times and ensure accurate digital health records.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  '100% Digital Health Records',
                  'Real-Time Queue Tracking',
                  'Modular Cleanroom OTs',
                  'Cloud PDF Prescriptions',
                  'On-Site Optical & Diagnostics',
                  'Emergency Trauma Unit',
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    <CheckCircle2 size={16} color="var(--color-teal-light)" />
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <Link to={user ? '/patient/book' : '/register'} className="btn btn-primary btn-lg">
                  Book Your Visit Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Visual Box */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(26, 34, 54, 0.9), rgba(13, 148, 136, 0.1))',
              borderColor: 'rgba(13, 148, 136, 0.3)',
              padding: '2.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12,
                  background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HeartPulse size={26} color="var(--color-teal-light)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontFamily: 'Outfit' }}>VisionCare Single-Branch Center</h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Quality Eye Care Delivered Daily</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-teal-light)' }}>15,000+</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Successful Eye Surgeries</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-teal-light)' }}>98.5%</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Patient Satisfaction</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-teal-light)' }}>5 Clinics</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Sub-specialty Departments</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-teal-light)' }}>100%</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Digital Prescription PDF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{
        background: 'var(--color-navy)',
        borderTop: '1px solid var(--color-border)',
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem) 1.5rem',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <Eye size={22} color="var(--color-teal-light)" />
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.125rem' }}>VisionCare</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Single-branch eye hospital with automated ticketing, real-time doctor assignment, and persistent patient records.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.875rem', color: '#E2E8F0' }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <Link to="/register" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Patient Sign Up</Link>
                <Link to="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Staff / Patient Login</Link>
                <a href="#doctors" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Doctor Availability</a>
                <a href="#services" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Eye Specialties</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.875rem', color: '#E2E8F0' }}>Departments</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                <span>General Ophthalmology</span>
                <span>Cornea & LASIK</span>
                <span>Retina & Vitreous</span>
                <span>Cataract Surgery</span>
                <span>Glaucoma Care</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.875rem', color: '#E2E8F0' }}>Contact & Hours</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                <div>📍 Gulshan Avenue, Dhaka</div>
                <div>📞 +880 1711-000000</div>
                <div>⏰ Sat - Thu: 8:00 AM - 8:00 PM</div>
                <div>🚑 Emergency: 24/7 Active</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
            © {new Date().getFullYear()} VisionCare Eye Hospital. All rights reserved. Powered by Automated Queue Management System.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper icon component
function DoorOpenIcon({ size, color }) {
  return <Building2 size={size} color={color} />;
}
