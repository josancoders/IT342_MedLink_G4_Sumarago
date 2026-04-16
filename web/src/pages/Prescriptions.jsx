import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPrescriptions } from '../api/auth';
import '../styles/Prescriptions.css';

export default function Prescriptions() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    loadPrescriptions();
  }, [navigate]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await getPrescriptions(token);
      setPrescriptions(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load prescriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pr-root">
      <aside className="pr-sidebar">
        <div className="pr-logo">MedLink</div>
        <nav className="pr-nav">
          <Link to="/dashboard" className="pr-nav-item">⊞ Dashboard</Link>
          <Link to="/find-doctors" className="pr-nav-item">🔍 Find Doctors</Link>
          <Link to="/appointments" className="pr-nav-item">📋 My Appointments</Link>
          <Link to="/medical-history" className="pr-nav-item">📄 Medical History</Link>
          <Link to="/prescriptions" className="pr-nav-item active">💊 Prescriptions</Link>
        </nav>
        <button className="pr-logout" onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}>→ Logout</button>
      </aside>

      <div className="pr-main">
        <header className="pr-header">
          <div></div>
          <h2>Prescriptions</h2>
          <div></div>
        </header>

        <main className="pr-content">
          {error && <div className="pr-error">{error}</div>}

          {loading ? (
            <div className="pr-loading">Loading prescriptions...</div>
          ) : prescriptions.length === 0 ? (
            <div className="pr-empty">
              <p>💊 No prescriptions yet</p>
            </div>
          ) : (
            <div className="pr-list">
              {prescriptions.map(presc => (
                <div key={presc.id} className="pr-prescription">
                  <div className="pr-icon">💊</div>
                  
                  <div className="pr-details">
                    <h4>{presc.medication}</h4>
                    <p className="pr-doctor">👨‍⚕️ {presc.doctorName}</p>
                    <p className="pr-dosage">📋 {presc.dosage} - {presc.frequency}</p>
                    <p className="pr-duration">⏱️ Duration: {presc.duration}</p>
                  </div>

                  <div className="pr-actions">
                    <button className="pr-btn-download">📥 Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
