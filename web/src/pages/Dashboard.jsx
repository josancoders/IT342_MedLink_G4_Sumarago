import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Dashboard.css';

const RECOMMENDED_DOCTORS = [
  { id: 1, name: 'Dr. Sophia Chen',   initials: 'SC', color: '#dbeafe', specialty: 'Cardiologist',  exp: '14 yrs', schedule: 'Mon, Wed, Fri', fee: 120 },
  { id: 2, name: 'Dr. Marcus Rivera', initials: 'MR', color: '#fef3c7', specialty: 'Neurologist',   exp: '10 yrs', schedule: 'Tue, Thu',      fee: 150 },
  { id: 3, name: 'Dr. Aisha Patel',   initials: 'AP', color: '#ede9fe', specialty: 'Dermatologist', exp: '8 yrs',  schedule: 'Mon, Fri',      fee: 90  },
];

const UPCOMING = [
  { date: '10', month: 'Mar', doctor: 'Dr. Sophia Chen',   time: '10:00 AM', status: 'Confirmed' },
  { date: '14', month: 'Mar', doctor: 'Dr. Marcus Rivera', time: '2:00 PM',  status: 'Pending'   },
];

const NAV_LINKS = [
  { label: 'Dashboard',       path: '/dashboard',    icon: '⊞' },
  { label: 'Find Doctors',    path: '/find-doctors',  icon: '🔍' },
  { label: 'My Appointments', path: '/appointments',  icon: '📋' },
  { label: 'Medical History', path: '/medical',       icon: '📄' },
  { label: 'Prescriptions',   path: '/prescriptions', icon: '💊' },
];



export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      setUser(JSON.parse(stored));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
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
                <a href="#" className="db-view-all">View All →</a>
              </div>

              <div className="db-doctor-cards">
                {RECOMMENDED_DOCTORS.map(doc => (
                  <div key={doc.id} className="db-doctor-card">
                    <div className="db-doc-top">
                      <div className="db-doc-avatar" style={{ background: doc.color }}>
                        {doc.initials}
                      </div>
                      <div>
                        <p className="db-doc-name">{doc.name}</p>
                        <p className="db-doc-spec">{doc.specialty} · {doc.exp}</p>
                      </div>
                    </div>
                    <div className="db-doc-meta">
                      <span className="db-doc-schedule">🕐 {doc.schedule}</span>
                      <span className="db-doc-fee">${doc.fee}</span>
                    </div>
                    <button className="db-book-btn">Book an appointment</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — Upcoming Appointments */}
            <aside className="db-right-col">
              <div className="db-upcoming-header">
                <h3 className="db-section-title">Upcoming Appointments</h3>
                <a href="#" className="db-view-all">View All →</a>
              </div>
              <div className="db-upcoming-list">
                {UPCOMING.map((appt, i) => (
                  <div key={i} className="db-upcoming-card">
                    <div className="db-upcoming-date">
                      <span className="db-upcoming-day">{appt.date}</span>
                      <span className="db-upcoming-month">{appt.month}</span>
                    </div>
                    <div className="db-upcoming-info">
                      <p className="db-upcoming-doctor">{appt.doctor}</p>
                      <p className="db-upcoming-time">{appt.time}</p>
                    </div>
                    <span className={`db-status db-status-${appt.status.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>

      </div>
    </div>
  );
}
