import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyAppointments, cancelAppointment } from '../api/auth';
import '../styles/MyAppointments.css';

export default function MyAppointments() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    loadAppointments();
  }, [navigate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments(token);
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await cancelAppointment(appointmentId, token);
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'CANCELLED' } : apt
      ));
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const Now = new Date();
  const upcoming = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= Now && apt.status !== 'CANCELLED';
  });

  const past = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate < Now || apt.status === 'CANCELLED';
  });

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#fbbf24',
      'CONFIRMED': '#10b981',
      'COMPLETED': '#6b7280',
      'CANCELLED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const appointmentList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="ma-root">
      <aside className="ma-sidebar">
        <div className="ma-logo">MedLink</div>
        <nav className="ma-nav">
          <Link to="/dashboard" className="ma-nav-item">⊞ Dashboard</Link>
          <Link to="/find-doctors" className="ma-nav-item">🔍 Find Doctors</Link>
          <Link to="/appointments" className="ma-nav-item active">📋 My Appointments</Link>
          <Link to="/medical-history" className="ma-nav-item">📄 Medical History</Link>
          <Link to="/prescriptions" className="ma-nav-item">💊 Prescriptions</Link>
        </nav>
        <button className="ma-logout" onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}>→ Logout</button>
      </aside>

      <div className="ma-main">
        <header className="ma-header">
          <div></div>
          <h2>My Appointments</h2>
          <div></div>
        </header>

        <main className="ma-content">
          <div className="ma-tabs">
            <button 
              className={`ma-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              📅 Upcoming ({upcoming.length})
            </button>
            <button 
              className={`ma-tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              📋 Past ({past.length})
            </button>
          </div>

          {error && <div className="ma-error">{error}</div>}

          {loading ? (
            <div className="ma-loading">Loading appointments...</div>
          ) : appointmentList.length === 0 ? (
            <div className="ma-empty">
              <p>No {activeTab} appointments</p>
              <Link to="/find-doctors" className="ma-btn-book">Book Now</Link>
            </div>
          ) : (
            <div className="ma-list">
              {appointmentList.map(apt => (
                <div key={apt.id} className="ma-appointment">
                  <div className="ma-apt-left">
                    <div className="ma-date">
                      <div className="ma-day">{new Date(apt.appointmentDate).getDate()}</div>
                      <div className="ma-month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                  </div>
                  
                  <div className="ma-apt-middle">
                    <h4>{apt.doctorName}</h4>
                    <p className="ma-specialty">{apt.specialization}</p>
                    <p className="ma-time">⏰ {apt.timeSlot}</p>
                    <p className="ma-reason">📝 {apt.reason}</p>
                  </div>

                  <div className="ma-apt-right">
                    <span 
                      className="ma-status" 
                      style={{ backgroundColor: getStatusColor(apt.status) }}
                    >
                      {apt.status}
                    </span>
                    
                    {activeTab === 'upcoming' && apt.status !== 'CANCELLED' && (
                      <button 
                        className="ma-btn-cancel"
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancel
                      </button>
                    )}
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
