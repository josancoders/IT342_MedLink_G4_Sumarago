import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    consultationFee: '',
    location: '',
    languages: '',
    education: '',
    bio: '',
  });
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });
  const [newTimeSlot, setNewTimeSlot] = useState('');

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
      fetchDoctorProfile(userData.userId);
    }
  }, [navigate]);

  const fetchDoctorProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching doctor profile for userId:', userId);
      
      const response = await fetch(`http://localhost:8080/api/doctors/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Doctor data received:', data);
        setDoctor(data);
        setFormData({
          fullName: data.fullName || '',
          email: user?.email || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          consultationFee: data.consultationFee || '',
          location: data.location || '',
          languages: data.languages || '',
          education: data.education || '',
          bio: data.bio || '',
        });
        
        // Parse available schedule if it exists
        if (data.availableSchedule) {
          try {
            setSchedule(JSON.parse(data.availableSchedule));
          } catch (e) {
            console.log('Could not parse schedule');
            setSchedule({
              Monday: [],
              Tuesday: [],
              Wednesday: [],
              Thursday: [],
              Friday: [],
            });
          }
        }
      } else {
        // Doctor record doesn't exist yet - initialize with empty form
        // This will be created on first save
        console.log('Doctor profile not found (404), initializing empty form');
        setDoctor(null);
        setFormData({
          fullName: user?.name || '',
          email: user?.email || '',
          phone: '',
          specialization: '',
          consultationFee: '',
          location: '',
          languages: '',
          education: '',
          bio: '',
        });
        setMessage('Profile will be created on first save');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Even on error, show the form with empty values
      setDoctor(null);
      setFormData({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        specialization: '',
        consultationFee: '',
        location: '',
        languages: '',
        education: '',
        bio: '',
      });
      setMessage('Note: Profile will be created on first save');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        specialization: formData.specialization || null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        bio: formData.bio || null,
        phone: formData.phone || null,
        location: formData.location || null,
        languages: formData.languages || null,
        education: formData.education || null,
        availableSchedule: JSON.stringify(schedule),
      };

      console.log('Saving profile...');

      let response;
      
      if (doctor && doctor.id) {
        // Update existing doctor
        console.log('Updating doctor:', doctor.id);
        response = await fetch(`http://localhost:8080/api/doctors/${doctor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      } else {
        // Create new doctor profile
        console.log('Creating new doctor profile for userId:', user.userId);
        response = await fetch(`http://localhost:8080/api/doctors/user/${user.userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      }

      console.log('Response status:', response.status);

      if (response.ok) {
        setMessage('Profile updated successfully! ✅');
        setEditing(false);
        fetchDoctorProfile(user.userId);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage('Failed to update profile: ' + response.status);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error: ' + error.message);
    }
  };

  const handleAddTimeSlot = (day) => {
    if (!newTimeSlot.trim()) return;
    const updatedSchedule = { ...schedule };
    if (!updatedSchedule[day]) {
      updatedSchedule[day] = [];
    }
    if (!updatedSchedule[day].includes(newTimeSlot)) {
      updatedSchedule[day].push(newTimeSlot);
      updatedSchedule[day].sort();
      setSchedule(updatedSchedule);
      setNewTimeSlot('');
    }
  };

  const handleRemoveTimeSlot = (day, time) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day] = updatedSchedule[day].filter(t => t !== time);
    setSchedule(updatedSchedule);
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'D';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '30px 0', position: 'relative', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <h2 style={{ padding: '0 20px', margin: '0 0 30px 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>🏥 MedLink</h2>
        
        {/* Doctor Card */}
        {!loading && doctor && (
          <div style={{ padding: '0 20px', marginBottom: '30px' }}>
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
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
                fontSize: '24px',
                margin: '0 auto 12px',
              }}>
                {initials}
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                {user.name}
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>
                {formData.specialization || 'Doctor'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  ${formData.consultationFee || '0'}/session
                </span>
                <span style={{
                  backgroundColor: '#d1fae5',
                  color: '#047857',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && doctor && (
          <div style={{ padding: '0 20px', marginBottom: '30px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Quick Stats</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>👥 Total Patients</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>128</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>📋 Appointments</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>3.6k</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>⭐ Rating</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>4.8★</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>🎓 Experience</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>10 yrs</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ marginBottom: 'auto' }}>
          {[
            { label: 'Dashboard', path: '/doctor', icon: '⊞' },
            { label: 'Appointments', path: '/doctor/appointments', icon: '📋' },
            { label: 'Upload Prescription', path: '/doctor/upload-prescription', icon: '💊' },
            { label: 'My Profile', path: '/doctor/profile', icon: '👤' },
          ].map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: location.pathname === link.path ? '#3B82F6' : '#6b7280',
                textDecoration: 'none',
                cursor: 'pointer',
                borderLeft: location.pathname === link.path ? '3px solid #3B82F6' : '3px solid transparent',
                backgroundColor: location.pathname === link.path ? '#eff6ff' : 'transparent',
                fontWeight: location.pathname === link.path ? 600 : 500,
                fontSize: '14px',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '16px' }}>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
          style={{
            margin: '20px',
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            width: 'auto',
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 30px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>My Profile</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Manage your professional information</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: '8px 16px',
                backgroundColor: editing ? '#ef4444' : '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                whiteSpace: 'nowrap',
              }}
            >
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
            <button
              onClick={() => navigate('/doctor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {initials}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Doctor</p>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            {message && (
              <div style={{
                padding: '12px',
                marginBottom: '20px',
                borderRadius: '6px',
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: message.includes('✅') ? '#065f46' : '#991b1b',
                fontSize: '14px',
                fontWeight: 500
              }}>
                {message}
              </div>
            )}

            {loading ? (
              <p>Loading profile...</p>
            ) : (
              <>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Professional Information</h2>

                {!editing ? (
                  /* Display Mode */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Full Name</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user.name}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Email</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{user.email}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Phone</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formData.phone || '+1 (555) 012-3456'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Specialization</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formData.specialization || '—'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Consultation Fee</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>${formData.consultationFee || '0'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Location</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formData.location || 'New York, NY'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Languages</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formData.languages || 'English, Spanish'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Education</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formData.education || 'MD, Johns Hopkins University'}</p>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="e.g., Cardiologist"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Consultation Fee ($)</label>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        placeholder="e.g., 150"
                        min="0"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., New York, NY"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Languages</label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        placeholder="e.g., English, Spanish"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Education</label>
                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        placeholder="e.g., MD, Johns Hopkins University"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell patients about yourself..."
                        rows="4"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* Available Schedule Section */}
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                        Available Schedule
                      </h3>
                      
                      {Object.entries(schedule).map(([day, times]) => (
                        <div key={day} style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>
                            {day}
                          </label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', minHeight: '32px' }}>
                            {times && times.length > 0 ? (
                              times.map((time, idx) => (
                                <button
                                  key={`${day}-${idx}`}
                                  onClick={() => handleRemoveTimeSlot(day, time)}
                                  style={{
                                    backgroundColor: '#DBEAFE',
                                    color: '#1E40AF',
                                    border: '1px solid #93C5FD',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                  }}
                                  title="Click to remove"
                                >
                                  {time} ✕
                                </button>
                              ))
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>No time slots added</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="time"
                              value={newTimeSlot}
                              onChange={(e) => setNewTimeSlot(e.target.value)}
                              style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                              placeholder="HH:MM"
                            />
                            <button
                              onClick={() => handleAddTimeSlot(day)}
                              style={{
                                backgroundColor: '#E0E7FF',
                                color: '#4F46E5',
                                border: '1px solid #C7D2FE',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              Add Time
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editing && !loading && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                    <button
                      onClick={handleSave}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                    >
                      ✅ Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                )}

                {!editing && (
                  <div style={{ marginTop: '24px' }}>
                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Bio</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>
                      {formData.bio || 'Board-certified Neurologist with 10+ years of experience in diagnosing and treating neurological disorders. Passionate about patient-centered care and evidence-based medicine.'}
                    </p>

                    {/* Available Schedule Display */}
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Available Schedule</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {Object.entries(schedule).map(([day, times]) => (
                          times && times.length > 0 && (
                            <div key={day}>
                              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                                {day}
                              </p>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {times.map((time, idx) => (
                                  <span
                                    key={`${day}-${idx}`}
                                    style={{
                                      backgroundColor: '#E0E7FF',
                                      color: '#4F46E5',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                    }}
                                  >
                                    {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
