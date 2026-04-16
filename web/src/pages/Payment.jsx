import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentData = location.state?.appointment;
  const [loading, setLoading] = useState(false);

  console.log('Payment page - location state:', location.state);
  console.log('Payment page - appointment data:', appointmentData);

  if (!appointmentData) {
    console.warn('No appointment data in Payment page');
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>No appointment data available</h2>
        <p>Please go back and try booking the appointment again.</p>
        <button 
          onClick={() => navigate('/find-doctors')}
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
          Back to Find Doctors
        </button>
      </div>
    );
  }

  const handleProceedPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('Sending appointment data:', {
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: appointmentData.timeSlot,
        reason: appointmentData.reason,
      });
      
      // Create the appointment
      const response = await fetch('http://localhost:8080/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: appointmentData.doctorId,
          appointmentDate: appointmentData.appointmentDate,
          timeSlot: appointmentData.timeSlot,
          reason: appointmentData.reason,
        }),
      });

      console.log('Response status:', response.status, 'Headers:', response.headers);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Appointment response:', responseData);
      } catch (jsonErr) {
        console.error('Failed to parse response JSON:', jsonErr);
        responseData = { message: 'Invalid response format' };
      }

      if (response.ok) {
        navigate('/appointment-confirmation', { 
          state: { 
            appointmentId: responseData.appointmentId,
            appointment: appointmentData 
          } 
        });
      } else {
        const errorMsg = responseData?.message || `HTTP ${response.status}`;
        alert(`Failed to confirm appointment: ${errorMsg}`);
        
        if (response.status === 403) {
          alert('Invalid or expired session. Please log out and log back in.');
        }
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert(`Error confirming appointment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#0f172a',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '30px',
          paddingLeft: 0,
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '30px', color: '#0f172a' }}>
        Payment
      </h1>

      {/* Appointment Summary Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Appointment Summary
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          borderTop: '1px solid #E5E7EB',
          paddingTop: '16px',
        }}>
          <div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Doctor</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>
              {appointmentData.doctorName}
            </p>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Specialization</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '16px' }}>
              {appointmentData.specialization}
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
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Reason for Visit</span>
            <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '14px' }}>
              {appointmentData.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Payment Method
        </h2>

        <div style={{
          backgroundColor: '#F3F4F6',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#4F46E5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            💳
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
              Stripe Secure Checkout
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              You will be redirected to Stripe's payment page
            </p>
          </div>
        </div>
      </div>

      {/* Consultation Fee */}
      <div style={{
        backgroundColor: '#F0F9FF',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        borderLeft: '4px solid #3B82F6',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
            Consultation Fee
          </span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6' }}>
            ${appointmentData.consultationFee}
          </span>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handleProceedPayment}
        disabled={loading}
        style={{
          width: '100%',
          backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 20px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '8px',
        }}
        onMouseOver={(e) => {
          if (!loading) e.target.style.backgroundColor = '#2563EB';
        }}
        onMouseOut={(e) => {
          if (!loading) e.target.style.backgroundColor = '#3B82F6';
        }}
      >
        {loading ? 'Processing...' : `💳 Pay $${appointmentData.consultationFee} Now`}
      </button>
    </div>
  );
}
