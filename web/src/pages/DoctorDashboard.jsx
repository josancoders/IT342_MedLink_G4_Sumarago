import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/doctor', icon: '⊞' },
  { label: 'My Appointments', path: '/doctor/appointments', icon: '📋' },
  { label: 'Upload Prescription', path: '/doctor/upload-prescription', icon: '💊' },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      const userData = JSON.parse(stored);
      // Check if user is doctor
      if (userData.role !== 'DOCTOR') {
        navigate('/dashboard');
      }
      setUser(userData);
      fetchAppointments();
    }
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch doctor's appointments
      const response = await fetch('http://localhost:8080/api/appointments/doctor/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Fetch doctor stats
      const statsResponse = await fetch('http://localhost:8080/api/appointments/doctor/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok && statsResponse.ok) {
        const data = await response.json();
        const statsData = await statsResponse.json();
        
        // Filter today's appointments
        const today = new Date().toDateString();
        const todayAppointments = data.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        );
        
        setAppointments(todayAppointments);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`Appointment marked as ${newStatus}`);
        fetchAppointments();
      } else {
        alert('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'D';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '30px 0', position: 'relative' }}>
        <h2 style={{ padding: '0 20px', margin: '0 0 30px 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>🏥 MedLink</h2>
        <nav>
          {NAV_LINKS.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <a
                key={i}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  color: isActive ? '#3B82F6' : '#6b7280',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '16px' }}>{link.icon}</span>
                {link.label}
              </a>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 30px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Doctor Dashboard</h1>
            <input
              type="text"
              placeholder="Search Doctor..."
              style={{
                flex: '0 1 300px',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: '#f9fafb',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/doctor/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {user?.name?.[0] || 'D'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{user?.name || 'Doctor'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Doctor</p>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '30px' }}>
          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <StatCard icon="📅" title="Today's Appointments" value={stats.today} color="#3B82F6" />
            <StatCard icon="⏳" title="Pending Reviews" value={stats.pending} color="#F59E0B" />
            <StatCard icon="👥" title="Total Patients" value={stats.total} color="#10B981" />
          </div>

          {/* Appointments List */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Today's Schedule</h2>
            
            {loading ? (
              <p style={{ color: '#6b7280' }}>Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No appointments scheduled.</p>
            ) : (
              <div>
                {appointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 0',
                      borderBottom: index < appointments.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}>
                        {apt.patientName || `Patient #${apt.patientId}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {apt.timeSlot}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={getStatusBadge(apt.status)}>
                        {apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        disabled={apt.status === 'COMPLETED'}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: apt.status === 'COMPLETED' ? '#d1d5db' : '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: apt.status === 'COMPLETED' ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, title, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color }}>
        {value}
      </p>
      <p style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: 500 }}>
        {title}
      </p>
    </div>
  );
}

function getStatusBadge(status) {
  const styles = {
    CONFIRMED: { backgroundColor: '#dbeafe', color: '#0369a1', fontWeight: 600 },
    COMPLETED: { backgroundColor: '#d1fae5', color: '#047857', fontWeight: 600 },
    PENDING_PAYMENT: { backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 },
    CANCELLED: { backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 },
  };

  const badgeStyle = styles[status] || styles.PENDING_PAYMENT;
  return {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    ...badgeStyle,
  };
}

// Styles
const sidebarStyle = {
  width: '280px',
  backgroundColor: '#1e3a8a',
  color: 'white',
  padding: '30px 0',
  boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
};

const logoStyle = {
  padding: '0 20px',
  margin: '0 0 30px 0',
  fontSize: '24px',
  fontWeight: 700,
  borderBottom: '2px solid rgba(255,255,255,0.1)',
  paddingBottom: '20px',
};

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '15px 20px',
  color: 'rgba(255,255,255,0.8)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s',
  borderLeft: '4px solid transparent',
  fontSize: '14px',
};

const logoutButtonStyle = {
  position: 'absolute',
  bottom: '30px',
  left: '20px',
  right: '20px',
  padding: '12px',
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
};

const topBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: '20px 30px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: '1px solid #e2e8f0',
};

const initialsStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  backgroundColor: '#3B82F6',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '16px',
};


const cardStyle = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};
