import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { getMyAppointments } from '../api/auth';

const RECOMMENDED_DOCTORS = [
  { id: 1, name: 'Dr. Sophia Chen',   initials: 'SC', color: '#dbeafe', specialty: 'Cardiologist',  exp: '14 yrs', schedule: 'Mon, Wed, Fri', fee: 120 },
  { id: 2, name: 'Dr. Marcus Rivera', initials: 'MR', color: '#fef3c7', specialty: 'Neurologist',   exp: '10 yrs', schedule: 'Tue, Thu',      fee: 150 },
  { id: 3, name: 'Dr. Aisha Patel',   initials: 'AP', color: '#ede9fe', specialty: 'Dermatologist', exp: '8 yrs',  schedule: 'Mon, Fri',      fee: 90  },
];

// upcoming will be loaded dynamically for the logged-in user

const NAV_LINKS = [
  { label: 'Dashboard',       path: '/dashboard',    icon: '⊞' },
  { label: 'Find Doctors',    path: '/find-doctors',  icon: '🔍' },
  { label: 'My Appointments', path: '/appointments',  icon: '📋' },
  { label: 'Prescriptions',   path: '/prescriptions', icon: '💊' },
];



export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      setUser(JSON.parse(stored));
      fetchDoctors();
      fetchAppointments();
    }
    // Listen for doctor profile updates from other pages/tabs
    const onStorage = (e) => {
      if (e.key === 'doctorProfileUpdated') {
        fetchDoctors();
      }
    };
    window.addEventListener('storage', onStorage);
    const onCustom = (e) => {
      // update local user from localStorage (profile component already wrote it)
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
      fetchDoctors();
    };
    window.addEventListener('doctorProfileUpdated', onCustom);
    return () => window.removeEventListener('storage', onStorage);
    // cleanup custom event
    // NOTE: we can't remove both in same return easily; attach cleanup below
  }, [navigate]);

  useEffect(() => {
    const onCustom = (e) => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
      fetchDoctors();
    };
    window.addEventListener('doctorProfileUpdated', onCustom);
    return () => window.removeEventListener('doctorProfileUpdated', onCustom);
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const resp = await getMyAppointments(token);
      if (resp && resp.data) {
        setAppointments(resp.data || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="db-root">
      {/* ── Left Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-logo">MedLink</div>

        <nav className="db-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`db-nav-item${location.pathname === link.path ? ' active' : ''}`}
            >
              <span className="db-nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="db-logout" onClick={handleLogout}>→ Logout</button>
      </aside>

      {/* ── Main Area ── */}
      <div className="db-main">
        {/* Header */}
        <header className="db-header">
          <div className="db-search-wrap">
            <span className="db-search-icon">🔍</span>
            <input
              className="db-search"
              placeholder="Search Doctor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="db-header-right">
            <button className="db-appt-btn">📋 My Appointments</button>
            <div className="db-avatar">{initials}</div>
            <span className="db-username">{user.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="db-content">
          <div className="db-body">
            {/* Left column */}
            <div className="db-left-col">
              <p className="db-greeting">Hi, {user.name}</p>
              <h2 className="db-welcome">Welcome Back 👋</h2>

              {/* Promo Banner */}
              <div className="db-banner">
                <div className="db-banner-text">
                  <p className="db-banner-title">Find the right doctor<br />Book your appointment today</p>
                  <p className="db-banner-sub">Search by specialization · View availability · Pay securely</p>
                  <button className="db-banner-btn">Book Appointment →</button>
                </div>
                <div className="db-banner-icon">🩺</div>
              </div>

              {/* Recommended Doctors */}
              <div className="db-section-header">
                <h3 className="db-section-title">Recommended Doctors</h3>
                <a href="/find-doctors" className="db-view-all">View All →</a>
              </div>
              <div className="db-doctor-cards">
                {doctors && doctors.length > 0 ? (
                  doctors.slice(0,3).map(doc => (
                    <div key={doc.id} className="db-doctor-card">
                      <div className="db-doc-top">
                        <div className="db-doc-avatar" style={{ background: doc.color || '#dbeafe' }}>
                          {(doc.fullName || doc.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="db-doc-name">{doc.fullName || doc.name}</p>
                          <p className="db-doc-spec">{doc.specialization || doc.specialty}</p>
                        </div>
                      </div>
                      <div className="db-doc-meta">
                        <span className="db-doc-fee">{doc.consultationFee ? `₱${doc.consultationFee}` : '₱N/A'}</span>
                        <span className="db-doc-schedule">{doc.schedule || doc.exp || 'Available on request'}</span>
                      </div>
                      <div className="db-doc-actions">
                        <Link to={`/doctors/${doc.id}`} className="db-btn-detail">View Profile</Link>
                        <button className="db-book-btn" onClick={() => navigate(`/book-appointment/${doc.id}`)}>Book Appointment</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="db-no-doctors">No doctors available</div>
                )}
              </div>
            </div>

            {/* Right column — Upcoming Appointments */}
            <aside className="db-right-col">
              <div className="db-upcoming-header">
                <h3 className="db-section-title">Upcoming Appointments</h3>
                <a href="#" className="db-view-all">View All →</a>
              </div>
              <div className="db-upcoming-list">
                {appointments && appointments.length > 0 ? (
                  appointments
                    .filter(appt => appt.status !== 'CANCELLED')
                    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                    .slice(0, 3)
                    .map((appt) => (
                      <div key={appt.id} className="db-upcoming-card">
                        <div className="db-upcoming-date">
                          <span className="db-upcoming-day">{new Date(appt.appointmentDate).getDate()}</span>
                          <span className="db-upcoming-month">{new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="db-upcoming-info">
                          <div className="db-upcoming-doctor">{appt.doctorName}</div>
                          <div className="db-upcoming-time">{appt.timeSlot}</div>
                        </div>
                        <span className={`db-status db-status-${(appt.status || 'PENDING').toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="db-upcoming-empty">No upcoming appointments</div>
                )}
              </div>
            </aside>
          </div>
        </main>

      </div>
    </div>
  );
}
