import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../api/auth';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generateTimeSlots = (openTime, closeTime, breaks = []) => {
    const slots = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    // Convert breaks to minutes for easier comparison
    const breakRanges = breaks.map(br => ({
      start: parseInt(br.start.split(':')[0]) * 60 + parseInt(br.start.split(':')[1]),
      end: parseInt(br.end.split(':')[0]) * 60 + parseInt(br.end.split(':')[1])
    }));
    
    let currentHour = openHour;
    let currentMin = openMin;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const currentTotalMin = currentHour * 60 + currentMin;
      
      // Check if this time is within any break
      const inBreak = breakRanges.some(br => currentTotalMin >= br.start && currentTotalMin < br.end);
      
      if (!inBreak) {
        const hour12 = currentHour % 12 || 12;
        const ampm = currentHour >= 12 ? 'PM' : 'AM';
        const timeStr = `${hour12.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')} ${ampm}`;
        slots.push(timeStr);
      }
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const getTimeSlotsForDate = (dateStr) => {
    if (!doctor || !doctor.availableSchedule || !dateStr) {
      return [];
    }
    
    try {
      const schedule = JSON.parse(doctor.availableSchedule);
      const date = new Date(dateStr);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[date.getDay()];
      
      const daySchedule = schedule[dayName];
      if (!daySchedule || !daySchedule.available) {
        return [];
      }
      
      const breaks = daySchedule.breaks || [];
      return generateTimeSlots(daySchedule.open, daySchedule.close, breaks);
    } catch (e) {
      console.log('Could not parse schedule:', e);
      return [];
    }
  };

  useEffect(() => {
    if (!user.userId) navigate('/login');
    loadDoctor();
  }, [doctorId, navigate, user.userId]);

  const loadDoctor = async () => {
    try {
      const response = await getDoctorById(doctorId);
      setDoctor(response.data);
    } catch (err) {
      setError('Failed to load doctor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update available time slots when date changes
    if (name === 'appointmentDate') {
      const slots = getTimeSlotsForDate(value);
      setAvailableTimeSlots(slots);
      setFormData(prev => ({
        ...prev,
        timeSlot: '' // Reset selected time slot
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.appointmentDate || !formData.timeSlot || !formData.reason.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      
      if (!doctor) {
        setError('Doctor information not available');
        return;
      }

      navigate('/payment', {
        state: {
          appointment: {
            doctorId: parseInt(doctorId),
            doctorName: doctor.fullName || 'Unknown Doctor',
            specialization: doctor.specialization || 'General Practitioner',
            consultationFee: doctor.consultationFee || 0,
            appointmentDate: formData.appointmentDate,
            timeSlot: formData.timeSlot,
            reason: formData.reason,
          }
        }
      });
    } catch (err) {
      console.error('Error navigating to payment:', err);
      setError(err.message || 'Failed to proceed to payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!doctor) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Doctor not found</div>;

  const initials = (doctor.fullName || 'D').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '30px',
            padding: 0,
          }}
        >
          ← Back
        </button>

        {/* Title */}
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          textAlign: 'center',
          margin: '0 0 40px 0',
          color: '#0f172a'
        }}>
          Book Appointment
        </h1>

        {/* Doctor Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3B82F6',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '20px',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
              {doctor.fullName || 'Doctor'}
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
              {doctor.specialization || 'Specialist'}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#3B82F6', fontWeight: 600 }}>
              ₱{doctor.consultationFee || '0'} / session
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {/* Appointment Date Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
              Appointment Date
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#f9fafb',
              }}
              placeholder="dd/mm/yyyy"
            />
          </div>

          {/* Time Slot Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
              Time Slot
            </label>
            {!formData.appointmentDate ? (
              <p style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>Select a date first to see available times</p>
            ) : availableTimeSlots.length === 0 ? (
              <p style={{ color: '#dc2626', fontSize: '13px' }}>No available slots for the selected date</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '10px',
              }}>
                {availableTimeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: formData.timeSlot === slot ? '#3B82F6' : '#f3f4f6',
                      color: formData.timeSlot === slot ? 'white' : '#6b7280',
                      border: formData.timeSlot === slot ? 'none' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      if (formData.timeSlot !== slot) {
                        e.target.style.backgroundColor = '#e5e7eb';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (formData.timeSlot !== slot) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason for Visit Field */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
              Reason for Visit
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Describe your symptoms or reason for this visit..."
              rows="5"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#f9fafb',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: submitting ? '#9ca3af' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
            onMouseOver={(e) => {
              if (!submitting) e.target.style.backgroundColor = '#2563EB';
            }}
            onMouseOut={(e) => {
              if (!submitting) e.target.style.backgroundColor = '#3B82F6';
            }}
          >
            {submitting ? 'Processing...' : 'Proceed to Payment →'}
          </button>
        </form>
      </div>
    </div>
  );
}
