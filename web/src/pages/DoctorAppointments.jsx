import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      const userData = JSON.parse(stored);
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
      const response = await fetch('http://localhost:8080/api/appointments/doctor/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
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
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const filterOptions = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];
  
  const filteredAppointments = filter === 'All' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter.toUpperCase() || apt.status === `PENDING_${filter.toUpperCase()}`);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '30px 0' }}>
        <h2 style={{ padding: '0 20px', margin: '0 0 30px 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>🏥 MedLink</h2>
        <nav>
          {[
            { label: 'Dashboard', path: '/doctor', icon: '⊞' },
            { label: 'Appointments', path: '/doctor/appointments', icon: '📋' },
            { label: 'Upload Prescription', path: '/doctor/upload-prescription', icon: '💊' },
          ].map((link, i) => (
            <a
              key={i}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: window.location.pathname === link.path ? '#3B82F6' : '#6b7280',
                textDecoration: 'none',
                cursor: 'pointer',
                borderLeft: window.location.pathname === link.path ? '3px solid #3B82F6' : '3px solid transparent',
                backgroundColor: window.location.pathname === link.path ? '#eff6ff' : 'transparent',
                fontWeight: window.location.pathname === link.path ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '16px' }}>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 30px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Appointments</h1>
          <button
            onClick={() => navigate('/doctor')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
            {filterOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filter === status ? '#3B82F6' : '#ffffff',
                  color: filter === status ? 'white' : '#6b7280',
                  border: filter === status ? 'none' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: filter === status ? 600 : 500,
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '8px', color: '#6b7280' }}>
              <p>No appointments found in this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                  }}
                >
                  {/* Patient Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                      {apt.patientName || 'Unknown Patient'}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>
                      📅 {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ⏰ {apt.timeSlot}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      📝 {apt.reason || 'General Checkup'}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={getStatusBadge(apt.status)}>
                      {apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}
                    </span>

                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                      disabled={apt.status === 'COMPLETED'}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: apt.status === 'COMPLETED' ? '#d1d5db' : '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: apt.status === 'COMPLETED' ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Update Status
                    </button>

                    <button
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Upload Prescription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  const styles = {
    CONFIRMED: { backgroundColor: '#dbeafe', color: '#0369a1', fontWeight: 600 },
    PENDING: { backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 },
    PENDING_PAYMENT: { backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 },
    COMPLETED: { backgroundColor: '#d1fae5', color: '#047857', fontWeight: 600 },
    CANCELLED: { backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 },
  };

  const badgeStyle = styles[status] || { backgroundColor: '#f3f4f6', color: '#6b7280', fontWeight: 500 };
  return {
    display: 'inline-block',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    ...badgeStyle,
  };
}
