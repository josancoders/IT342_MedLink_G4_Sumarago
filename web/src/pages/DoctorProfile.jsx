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
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    active: false,
    phone: '',
    specialization: '',
    consultationFee: '',
    location: '',
    languages: '',
    education: '',
    bio: '',
  });
  const [schedule, setSchedule] = useState({
    Sunday: { open: '', close: '', available: false, breaks: [] },
    Monday: { open: '', close: '', available: true, breaks: [] },
    Tuesday: { open: '', close: '', available: true, breaks: [] },
    Wednesday: { open: '', close: '', available: true, breaks: [] },
    Thursday: { open: '', close: '', available: true, breaks: [] },
    Friday: { open: '', close: '', available: true, breaks: [] },
    Saturday: { open: '', close: '', available: false, breaks: [] },
  });
  const [breakModal, setBreakModal] = useState({
    isOpen: false,
    day: null,
    breakStart: '',
    breakEnd: '',
  });

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
          active: data.active != null ? data.active : false,
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
              Sunday: { open: '', close: '', available: false, breaks: [] },
              Monday: { open: '', close: '', available: true, breaks: [] },
              Tuesday: { open: '', close: '', available: true, breaks: [] },
              Wednesday: { open: '', close: '', available: true, breaks: [] },
              Thursday: { open: '', close: '', available: true, breaks: [] },
              Friday: { open: '', close: '', available: true, breaks: [] },
              Saturday: { open: '', close: '', available: false, breaks: [] },
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
          active: false,
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
        active: false,
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
      setSaving(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const updateData = {
        fullName: formData.fullName || null,
        active: formData.active != null ? formData.active : null,
        specialization: formData.specialization || null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        bio: formData.bio || null,
        phone: formData.phone || null,
        location: formData.location || null,
        languages: formData.languages || null,
        education: formData.education || null,
        availableSchedule: JSON.stringify(schedule),
      };

      console.log('Saving profile with schedule:', schedule);

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
        setMessage('✅ Profile saved successfully! Your schedule has been updated.');
        setEditing(false);
        setSaving(false);
        // Refresh profile and update local user name so header updates immediately
        fetchDoctorProfile(user.userId);
        try {
          const updatedUser = { ...user, name: formData.fullName || user.name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          // Notify other tabs/pages to refresh doctor data
          try {
            localStorage.setItem('doctorProfileUpdated', JSON.stringify({ id: doctor?.id || null, ts: Date.now() }));
          } catch (e) {
            console.warn('Could not set doctorProfileUpdated flag', e);
          }
          // Also dispatch an in-page event so the current tab's other components update immediately
          try {
            const ev = new CustomEvent('doctorProfileUpdated', { detail: { id: doctor?.id || null, user: updatedUser } });
            window.dispatchEvent(ev);
          } catch (e) {
            console.warn('Could not dispatch doctorProfileUpdated event', e);
          }
        } catch (e) {
          console.warn('Could not update local user name', e);
        }
        setTimeout(() => setMessage(''), 5000);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage('❌ Failed to save profile: ' + response.status + '. Please try again.');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('❌ Error: ' + error.message);
      setSaving(false);
    }
  };

  const handleScheduleChange = (day, field, value) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day] = { ...updatedSchedule[day], [field]: value };
    setSchedule(updatedSchedule);
  };

  const handleAvailabilityToggle = (day) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day] = { 
      ...updatedSchedule[day], 
      available: !updatedSchedule[day].available 
    };
    setSchedule(updatedSchedule);
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleAddBreak = (day) => {
    setBreakModal({
      isOpen: true,
      day,
      breakStart: '',
      breakEnd: '',
    });
  };

  const handleSaveBreak = () => {
    if (!breakModal.breakStart || !breakModal.breakEnd) {
      alert('Please enter both start and end times');
      return;
    }

    const updatedSchedule = { ...schedule };
    if (!updatedSchedule[breakModal.day].breaks) {
      updatedSchedule[breakModal.day].breaks = [];
    }
    updatedSchedule[breakModal.day].breaks.push({
      start: breakModal.breakStart,
      end: breakModal.breakEnd,
    });
    setSchedule(updatedSchedule);
    setBreakModal({ isOpen: false, day: null, breakStart: '', breakEnd: '' });
  };

  const handleCloseBreakModal = () => {
    setBreakModal({ isOpen: false, day: null, breakStart: '', breakEnd: '' });
  };

  const handleRemoveBreak = (day, index) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day].breaks.splice(index, 1);
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
        
        {/* Sidebar: kept minimal (nav + logout). Doctor summary moved to main content and centered. */}

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

            {/* Centered Profile Header */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ maxWidth: '900px', width: '100%', display: 'flex', alignItems: 'center', gap: '24px', padding: '18px', borderRadius: '10px', background: '#fafafa', border: '1px solid #eef2f7' }}>
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '28px' }}>
                    {initials}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{user.name}</h3>
                      <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '13px' }}>{formData.specialization || 'Doctor'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>${formData.consultationFee || '0'}/session</span>
                      {(formData.active ?? doctor?.active ?? false) ? (
                        <span style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>Active</span>
                      ) : (
                        <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>Inactive</span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '16px', color: '#6b7280', fontSize: '13px', flexWrap: 'wrap' }}>
                    <div><strong style={{ color: '#0f172a' }}>{formData.location || '—'}</strong></div>
                    <div>{formData.languages || '—'}</div>
                    <div>{formData.education || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

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
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{formData.fullName || user.name}</p>
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

                    {/* Schedule removed here to avoid duplicate display; final schedule renders below */}
                  </div>
                ) : (
                  /* Edit Mode */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g., Dr. John Doe"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '6px' }}>
                      <label style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: '13px' }}>Visible to patients</label>
                      <input
                        type="checkbox"
                        name="active"
                        checked={!!formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                        title="When enabled the doctor will appear in patient search and booking"
                      />
                    </div>

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
                      <select
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'white' }}
                      >
                        <option value="" disabled>Select specialization</option>
                        <option>Cardiologist</option>
                        <option>Neurologist</option>
                        <option>Dermatologist</option>
                        <option>Pediatrician</option>
                        <option>Orthopedist</option>
                        <option>General Practitioner</option>
                        <option>Psychiatrist</option>
                        <option>Ophthalmologist</option>
                      </select>
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
                      
                      {Object.entries(schedule).map(([day, dayData]) => (
                        <div key={day} style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <label style={{ fontWeight: 600, color: '#374151', fontSize: '13px', minWidth: '80px' }}>
                              {day}
                            </label>
                            <input
                              type="checkbox"
                              checked={dayData.available}
                              onChange={() => handleAvailabilityToggle(day)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              title="Mark as available/not available"
                            />
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>
                              {dayData.available ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                          
                          {dayData.available && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                                <div>
                                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#6b7280', fontSize: '12px' }}>Open</label>
                                  <input
                                    type="time"
                                    value={dayData.open}
                                    onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#6b7280', fontSize: '12px' }}>Close</label>
                                  <input
                                    type="time"
                                    value={dayData.close}
                                    onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                                  />
                                </div>
                              </div>

                              {/* Breaks Section */}
                              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <label style={{ fontWeight: '500', color: '#374151', fontSize: '12px' }}>Breaks</label>
                                  <button
                                    type="button"
                                    onClick={() => handleAddBreak(day)}
                                    style={{
                                      backgroundColor: '#E0E7FF',
                                      color: '#4F46E5',
                                      border: '1px solid #C7D2FE',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      fontWeight: 500,
                                    }}
                                  >
                                    + Add Break
                                  </button>
                                </div>
                                {dayData.breaks && dayData.breaks.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {dayData.breaks.map((breakTime, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          backgroundColor: '#FEF3C7',
                                          padding: '6px 8px',
                                          borderRadius: '4px',
                                          fontSize: '12px',
                                          color: '#92400E',
                                        }}
                                      >
                                        <span>{formatTime(breakTime.start)} - {formatTime(breakTime.end)}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveBreak(day, idx)}
                                          style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#92400E',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '0 4px',
                                          }}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No breaks</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editing && !loading && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: saving ? '#9ca3af' : '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? '⏳ Saving...' : '✅ Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        opacity: saving ? 0.5 : 1,
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        {Object.entries(schedule).map(([day, dayData]) => (
                          <div key={day} style={{ padding: '12px', backgroundColor: dayData.available ? '#d1fae5' : '#f3f4f6', borderRadius: '6px', border: `1px solid ${dayData.available ? '#a7f3d0' : '#d1d5db'}` }}>
                            <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{day}</p>
                            {dayData.available ? (
                              <>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#047857', fontWeight: 600 }}>{formatTime(dayData.open)} - {formatTime(dayData.close)}</p>
                                {dayData.breaks && dayData.breaks.length > 0 ? (
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {dayData.breaks.map((b, i) => (
                                      <span key={i} style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{formatTime(b.start)} - {formatTime(b.end)}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>No breaks</p>
                                )}
                              </>
                            ) : (
                              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>Not Available</p>
                            )}
                          </div>
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

      {/* Break Modal */}
      {breakModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Add Break for {breakModal.day}
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>
                Break Start Time
              </label>
              <input
                type="time"
                value={breakModal.breakStart}
                onChange={(e) => setBreakModal({ ...breakModal, breakStart: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>
                Break End Time
              </label>
              <input
                type="time"
                value={breakModal.breakEnd}
                onChange={(e) => setBreakModal({ ...breakModal, breakEnd: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSaveBreak}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                ✅ Add Break
              </button>
              <button
                onClick={handleCloseBreakModal}
                style={{
                  flex: 1,
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
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
