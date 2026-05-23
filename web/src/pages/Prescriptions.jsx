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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    loadPrescriptions();
    
    // Auto-refresh prescriptions every 5 seconds
    const interval = setInterval(loadPrescriptions, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    // Refresh when other tabs upload/remove prescriptions
    const onStorage = (e) => {
      if (e.key === 'prescriptionUploaded') loadPrescriptions();
    };
    const onCustom = (e) => {
      loadPrescriptions();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('prescriptionUploaded', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('prescriptionUploaded', onCustom);
    };
  }, []);

  const loadPrescriptions = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:8080/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data || []);
        setError(null);
      } else {
        setError('Failed to load prescriptions');
      }
    } catch (err) {
      setError('Failed to load prescriptions');
      console.error(err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    if (!filename) {
      alert('No file associated with this prescription');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/prescriptions/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Failed to download file');
      }
    } catch (err) {
      console.error(err);
      alert('Error downloading file');
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
          <button 
            className="pr-refresh-btn"
            onClick={() => loadPrescriptions()}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              backgroundColor: refreshing ? '#d1d5db' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
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
                  <div className="pr-left">
                    <div className="pr-icon">📄</div>
                    <div className="pr-details">
                      <h4>{presc.doctorName ? `Dr. ${presc.doctorName}` : 'Doctor'}</h4>
                      <div className="pr-sub">{presc.specialty ? presc.specialty + ' · ' : ''}{presc.appointmentDate ? new Date(presc.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</div>
                      <div className="pr-filename">{presc.fileName || presc.filePath || ''}</div>
                    </div>
                  </div>

                  <div className="pr-actions">
                    <button 
                      className="pr-btn-download" 
                      onClick={() => handleDownload(presc.filePath || presc.fileName)}
                    >
                      ⬇ Download
                    </button>
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