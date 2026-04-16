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
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
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
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #E5E7EB',
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Appointment Details
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          <div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Doctor</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>
              {appointmentData.doctorName}
            </p>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Confirmation #</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>
              #{appointmentId}
            </p>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Date</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '16px' }}>
              {new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Time</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '16px' }}>
              {appointmentData.timeSlot}
            </p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Specialization</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '14px' }}>
              {appointmentData.specialization}
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div style={{
        backgroundColor: '#FEF3C7',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        borderLeft: '4px solid #F59E0B',
      }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#92400E' }}>
          📝 Next Steps:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E', fontSize: '14px' }}>
          <li>You will receive a confirmation email shortly</li>
          <li>Download the appointment details from your email</li>
          <li>Check your calendar for appointment reminders</li>
          <li>Arrive 10 minutes early if in-person</li>
        </ul>
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
