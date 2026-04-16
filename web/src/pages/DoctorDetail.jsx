import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDoctorById } from '../api/auth';
import '../styles/DoctorDetail.css';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    loadDoctor();
  }, [id, navigate]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const response = await getDoctorById(id);
      setDoctor(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load doctor details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dd-loading">Loading...</div>;
  if (error) return <div className="dd-error">{error}</div>;
  if (!doctor) return <div className="dd-error">Doctor not found</div>;

  return (
    <div className="dd-root">
      <aside className="dd-sidebar">
        <div className="dd-logo">MedLink</div>
        <nav className="dd-nav">
          <Link to="/dashboard" className="dd-nav-item">⊞ Dashboard</Link>
          <Link to="/find-doctors" className="dd-nav-item">🔍 Find Doctors</Link>
          <Link to="/appointments" className="dd-nav-item">📋 My Appointments</Link>
          <Link to="/medical-history" className="dd-nav-item">📄 Medical History</Link>
          <Link to="/prescriptions" className="dd-nav-item">💊 Prescriptions</Link>
        </nav>
        <button className="dd-logout" onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}>→ Logout</button>
      </aside>

      <div className="dd-main">
        <header className="dd-header">
          <Link to="/find-doctors" className="dd-back">← Back</Link>
          <h2>Doctor Profile</h2>
          <div></div>
        </header>

        <main className="dd-content">
          <div className="dd-container">
            <div className="dd-card">
              <div className="dd-header-section">
                <div className="dd-avatar">{doctor.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="dd-info">
                  <h1>{doctor.name}</h1>
                  <p className="dd-specialty">{doctor.specialization}</p>
                  <div className="dd-meta">
                    <span className="dd-fee">💰 ${doctor.consultationFee}/session</span>
                    <span className="dd-status">✓ Available</span>
                  </div>
                </div>
              </div>

              <div className="dd-section">
                <h3>About</h3>
                <p>{doctor.bio || 'Experienced healthcare professional with dedication to patient care.'}</p>
              </div>

              <div className="dd-section">
                <h3>Qualifications</h3>
                <ul>
                  <li>Board Certified {doctor.specialization}</li>
                  <li>10+ Years Clinical Experience</li>
                  <li>Published Researcher</li>
                  <li>Member of Professional Medical Associations</li>
                </ul>
              </div>

              <div className="dd-section">
                <h3>Available Schedule</h3>
                <div className="dd-schedule">
                  <div className="dd-day">
                    <span className="dd-day-name">Monday</span>
                    <span className="dd-times">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="dd-day">
                    <span className="dd-day-name">Tuesday</span>
                    <span className="dd-times">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="dd-day">
                    <span className="dd-day-name">Wednesday</span>
                    <span className="dd-times">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="dd-day">
                    <span className="dd-day-name">Thursday</span>
                    <span className="dd-times">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="dd-day">
                    <span className="dd-day-name">Friday</span>
                    <span className="dd-times">9:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="dd-actions">
                <Link to={`/book-appointment/${doctor.id}`} className="dd-btn-primary">Book Appointment</Link>
                <button className="dd-btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
              </div>
            </div>

            <div className="dd-sidebar-right">
              <div className="dd-rating-card">
                <h4>Patient Reviews</h4>
                <div className="dd-rating">⭐⭐⭐⭐⭐ 4.8/5</div>
                <p>Based on 124 reviews</p>
              </div>
              <div className="dd-contact-card">
                <h4>Contact</h4>
                <p>📧 {doctor.email}</p>
                <p>📍 Medical Center, 123 Health St.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
