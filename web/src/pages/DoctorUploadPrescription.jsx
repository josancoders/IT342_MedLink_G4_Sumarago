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
      const response = await fetch('http://localhost:8080/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show completed appointments
        setAppointments(data.filter(apt => apt.status === 'COMPLETED'));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage('❌ Please upload a PDF or image file (JPG, PNG)');
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

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', selectedAppointment);

      const response = await fetch('http://localhost:8080/api/prescriptions/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('✅ Prescription uploaded successfully!');
        setFile(null);
        setSelectedAppointment('');
        document.querySelector('input[type="file"]').value = '';
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

  return (
    <div style={{ padding: '30px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <button 
        onClick={() => navigate('/doctor')}
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginTop: 0, color: '#1a202c' }}>💊 Upload Prescription</h1>

        <form onSubmit={handleUpload}>
          {/* Appointment Selection */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
              Select Completed Appointment
            </label>
            <select
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="">-- Choose an appointment --</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  Patient #{apt.patientId} - {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.timeSlot}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
              Upload Prescription File
            </label>
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
                {file ? file.name : 'Click to select file or drag and drop'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                PDF, JPG, PNG (Max 5MB)
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: '12px',
                marginBottom: '20px',
                borderRadius: '6px',
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: message.includes('✅') ? '#065f46' : '#991b1b',
                fontSize: '14px',
              }}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedAppointment || !file}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: !selectedAppointment || !file || loading ? '#d1d5db' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: !selectedAppointment || !file || loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {loading ? 'Uploading...' : '✅ Upload Prescription'}
          </button>
        </form>

        {/* Info Box */}
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px', color: '#374151' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>📋 Requirements:</p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Select a completed appointment</li>
            <li>Upload prescription as PDF or image (JPG/PNG)</li>
            <li>File size must be under 5MB</li>
            <li>Patient will download the prescription from their account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
