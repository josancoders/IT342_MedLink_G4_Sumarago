import { useLocation, useNavigate } from 'react-router-dom';

export default function AppointmentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location.state?.appointmentId;
  const appointmentData = location.state?.appointment;

  if (!appointmentId) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>No appointment data available</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '760px', margin: '0 auto' }}>
      {/* Success Icon */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#D1FAE5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          margin: '0 auto 20px',
        }}>
          ✓
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>
          Appointment Confirmed!
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          Your appointment has been successfully booked
        </p>
      </div>

      {/* Confirmation Details */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        border: '1px solid #E5E7EB',
      }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
          Appointment Details
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px 28px',
        }}>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em' }}>Doctor</span>
            <p style={{ margin: '8px 0 0 0', color: '#0f172a', fontSize: '20px', fontWeight: 700 }}>
              {appointmentData.doctorName}
            </p>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em' }}>Date</span>
            <p style={{ margin: '8px 0 0 0', color: '#0f172a', fontSize: '18px', fontWeight: 600 }}>
              {new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em' }}>Time</span>
            <p style={{ margin: '8px 0 0 0', color: '#0f172a', fontSize: '18px', fontWeight: 600 }}>
              {appointmentData.timeSlot}
            </p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em' }}>Specialization</span>
            <p style={{ margin: '8px 0 0 0', color: '#0f172a', fontSize: '18px', fontWeight: 600 }}>
              {appointmentData.specialization}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button
          onClick={() => navigate('/appointments')}
          style={{
            backgroundColor: 'white',
            color: '#3B82F6',
            border: '2px solid #3B82F6',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
        >
          View Appointments
        </button>
        <button
          onClick={() => navigate('/find-doctors')}
          style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
        >
          Book Another
        </button>
      </div>
    </div>
  );
}
