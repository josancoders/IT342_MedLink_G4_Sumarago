import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorUploadPrescription() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadLoading, setUploadLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [prescriptionsMap, setPrescriptionsMap] = useState({});

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
        // Show completed appointments
        const completed = data.filter(apt => apt.status === 'COMPLETED');
        setAppointments(completed);
        // fetch prescriptions for these appointments
        completed.forEach(apt => fetchPrescriptionForAppointment(apt.id));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchPrescriptionForAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8080/api/prescriptions/appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const dto = await resp.json();
        setPrescriptionsMap(prev => ({ ...prev, [appointmentId]: dto }));
      } else {
        setPrescriptionsMap(prev => {
          const copy = { ...prev };
          delete copy[appointmentId];
          return copy;
        });
      }
    } catch (e) {
      console.error('Error fetching prescription for appointment', e);
    }
  };

  const handleRemovePrescription = async (appointmentId) => {
    if (!window.confirm('Remove uploaded prescription for this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8080/api/prescriptions/appointment/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setPrescriptionsMap(prev => {
          const copy = { ...prev };
          delete copy[appointmentId];
          return copy;
        });
        fetchAppointments();
        try {
          localStorage.setItem('prescriptionUploaded', String(appointmentId));
          window.dispatchEvent(new CustomEvent('prescriptionUploaded', { detail: { appointmentId } }));
        } catch (e) { }
      } else {
        alert('Failed to remove prescription');
      }
    } catch (e) {
      console.error(e);
      alert('Error removing prescription');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type - accept common document and image formats
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage('❌ Please upload a valid file (PDF, Images, Documents, Spreadsheets, Text)');
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage('❌ File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      setMessage('❌ Please select an appointment');
      return;
    }

    if (!file) {
      setMessage('❌ Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', selectedAppointment);
      const appointmentId = selectedAppointment;

      const response = await fetch('http://localhost:8080/api/prescriptions/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('✅ Prescription uploaded successfully!');
        // refresh prescription info for this appointment so it shows in the list
        fetchPrescriptionForAppointment(appointmentId);
        fetchAppointments();
        // notify other tabs/pages that a prescription was uploaded
        try {
          localStorage.setItem('prescriptionUploaded', String(appointmentId));
          window.dispatchEvent(new CustomEvent('prescriptionUploaded', { detail: { appointmentId } }));
        } catch (e) { /* ignore */ }

        setFile(null);
        setSelectedAppointment('');
        document.querySelector('input[type="file"]').value = '';
        // Keep success message for 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to upload prescription');
      }
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setMessage('❌ Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (filename) => {
    if (!filename) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/prescriptions/download/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
      console.error('Download error', err);
      alert('Error downloading file');
    }
  };

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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>💊 Upload Prescription</h1>
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

        {/* Content - Split Layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Side - Completed Appointments */}
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto', borderRight: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>📋 Completed Appointments</h2>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', alignItems: 'center' }}>
              <input
                type="search"
                placeholder="Search patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => { setSearchQuery(''); setFilterDate(''); }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >Clear</button>
            </div>

            {uploadLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '8px', color: '#6b7280' }}>
                <p>No completed appointments found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {appointments
                  .filter(apt => {
                    // status already filtered server-side, but be safe
                    if (apt.status && apt.status !== 'COMPLETED') return false;
                    if (searchQuery) {
                      const name = (apt.patientName || '').toLowerCase();
                      if (!name.includes(searchQuery.toLowerCase())) return false;
                    }
                    if (filterDate) {
                      try {
                        const aptDate = new Date(apt.appointmentDate);
                        const aptIso = aptDate.toISOString().split('T')[0];
                        if (aptIso !== filterDate) return false;
                      } catch (e) {
                        return false;
                      }
                    }
                    return true;
                  })
                  .map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt.id)}
                    style={{
                      backgroundColor: selectedAppointment == apt.id ? '#eff6ff' : 'white',
                      borderRadius: '8px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: selectedAppointment == apt.id ? '2px solid #3B82F6' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                      {apt.patientName || 'Unknown Patient'}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>
                      📅 {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ⏰ {apt.timeSlot}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      📝 {apt.reason || 'General Checkup'}
                    </p>
                    {/* uploaded file moved to right panel */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Upload Form */}
          <div style={{ width: '450px', padding: '30px', overflowY: 'auto', backgroundColor: '#fafbfc' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>📤 Upload File</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>Select an appointment from the left</p>

            <form onSubmit={handleUpload}>
              {/* Selected Appointment Display */}
              {selectedAppointment && (
                <div style={{ marginBottom: '25px', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '1px solid #0284c7' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0c4a6e' }}>
                    ✓ Selected: {appointments.find(a => a.id == selectedAppointment)?.patientName}
                  </p>
                </div>
              )}

              {/* If selected appointment has an uploaded prescription, show it here (right panel) */}
              {selectedAppointment && prescriptionsMap[selectedAppointment] && (
                <div style={{ marginBottom: '18px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>📎</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{prescriptionsMap[selectedAppointment].filePath}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Uploaded file for this appointment</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(prescriptionsMap[selectedAppointment].filePath)}
                      style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#06b6d4', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >Download</button>
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(selectedAppointment)}
                      style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >Remove</button>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                  Upload Prescription File
                </label>
                {file ? (
                  <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>📄</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#16a34a', fontSize: '14px' }}>{file.name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Size: {(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        document.querySelector('input[type="file"]').value = '';
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : null}
                <div
                  style={{
                    border: '2px dashed #3B82F6',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: '#f0f9ff',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>📤</div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 600, color: '#1e40af' }}>
                    {file ? 'Click to change file' : 'Click to select file or drag and drop'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    PDF, Images (JPG, PNG, GIF), Documents (DOC, DOCX), Spreadsheets (XLS, XLSX), Text - Max 5MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  style={{
                    padding: '16px',
                    marginBottom: '20px',
                    borderRadius: '6px',
                    backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                    color: message.includes('✅') ? '#065f46' : '#991b1b',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {message}
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div
                  style={{
                    padding: '16px',
                    marginBottom: '20px',
                    borderRadius: '6px',
                    backgroundColor: '#dbeafe',
                    color: '#0369a1',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '16px' }}>⏳</span>
                  Uploading your prescription... Please wait
                </div>
              )}

              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedAppointment || !file}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#9ca3af' : (selectedAppointment && file ? '#3B82F6' : '#d1d5db'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (loading || !selectedAppointment || !file) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    ✅ Upload Prescription
                  </>
                )}
              </button>
            </form>

            {/* Requirements */}
            <div style={{ marginTop: '30px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>📋 Requirements:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                <li>Select a completed appointment</li>
                <li>Upload prescription file</li>
                <li>File size must be under 5MB</li>
                <li>Patient will download the prescription from their account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
