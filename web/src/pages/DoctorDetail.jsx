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

    const onStorage = (e) => {
      if (e.key === 'doctorProfileUpdated') {
        try {
          const payload = JSON.parse(e.newValue || e.oldValue || '{}');
          if (!payload.id || String(payload.id) === String(id)) {
            loadDoctor();
          }
        } catch (err) {
          loadDoctor();
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
          <h2>Doctor's Profile</h2>
          <div></div>
        </header>

        <main className="dd-content">
          <div className="dd-container">
            <div className="dd-card" style={{ padding: '28px', borderRadius: 12 }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: '#E8F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#0f172a' }}>
                  {doctor.fullName.split(' ').map(n => n[0]).join('')}
                </div>

                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Dr. {doctor.fullName}</h1>
                  <p style={{ margin: '6px 0 12px 0', color: '#2563EB', fontWeight: 600 }}>{doctor.specialization}</p>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#b45309', padding: '6px 12px', borderRadius: 20, fontWeight: 700 }}>Consultation Fee: ₱{doctor.consultationFee}</span>
                    <span style={{ backgroundColor: '#DFF6EA', color: '#047857', padding: '6px 12px', borderRadius: 20, fontWeight: 700 }}>Available</span>
                    {doctor.experienceYears && <span style={{ backgroundColor: '#F3F4F6', color: '#6b7280', padding: '6px 12px', borderRadius: 20 }}> {doctor.experienceYears} years experience</span>}
                  </div>
                </div>
              </div>

              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eef2f7' }} />

              <div className="dd-section">
                <h3>Doctor Biography</h3>
                <p>{doctor.bio || 'Experienced healthcare professional with dedication to patient care.'}</p>
              </div>

              {doctor.education && (
                <div className="dd-section">
                  <h3>Education & Qualifications</h3>
                  <p>{doctor.education}</p>
                </div>
              )}

              <div className="dd-actions" style={{ marginTop: 18 }}>
                <Link to={`/book-appointment/${doctor.id}`} className="dd-btn-primary">Book Appointment</Link>
                <button className="dd-btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
              </div>
            </div>

            <div className="dd-sidebar-right">
              <div className="dd-contact-card">
                <h4>Contact Information</h4>
                <p>📧 {doctor.email || 'Not provided'}</p>
                {doctor.phone && <p>📞 {doctor.phone}</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
