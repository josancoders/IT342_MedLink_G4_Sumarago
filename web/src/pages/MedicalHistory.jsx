import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMedicalDocuments, uploadMedicalDocument, deleteMedicalDocument } from '../api/auth';
import '../styles/MedicalHistory.css';

export default function MedicalHistory() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    loadDocuments();
  }, [navigate]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getMedicalDocuments(token);
      setDocuments(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      alert('Please upload a PDF or image file');
      return;
    }

    try {
      setUploading(true);
      await uploadMedicalDocument(file, file.name, token);
      setError(null);
      loadDocuments();
    } catch (err) {
      setError('Failed to upload document');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteMedicalDocument(docId, token);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="mh-root">
      <aside className="mh-sidebar">
        <div className="mh-logo">MedLink</div>
        <nav className="mh-nav">
          <Link to="/dashboard" className="mh-nav-item">⊞ Dashboard</Link>
          <Link to="/find-doctors" className="mh-nav-item">🔍 Find Doctors</Link>
          <Link to="/appointments" className="mh-nav-item">📋 My Appointments</Link>
          <Link to="/medical-history" className="mh-nav-item active">📄 Medical History</Link>
          <Link to="/prescriptions" className="mh-nav-item">💊 Prescriptions</Link>
        </nav>
        <button className="mh-logout" onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}>→ Logout</button>
      </aside>

      <div className="mh-main">
        <header className="mh-header">
          <div></div>
          <h2>Medical History</h2>
          <label className="mh-upload-btn">
            📁 Upload Document
            <input 
              type="file" 
              accept=".pdf,image/*" 
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </header>

        <main className="mh-content">
          {error && <div className="mh-error">{error}</div>}
          {uploading && <div className="mh-uploading">Uploading...</div>}

          {loading ? (
            <div className="mh-loading">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="mh-empty">
              <p>📄 No medical documents yet</p>
              <label className="mh-upload-btn-secondary">
                Upload Your First Document
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <div className="mh-table">
              <div className="mh-table-header">
                <div className="mh-col-name">FILE NAME</div>
                <div className="mh-col-date">UPLOAD DATE</div>
                <div className="mh-col-size">SIZE</div>
                <div className="mh-col-actions">ACTIONS</div>
              </div>
              
              {documents.map(doc => (
                <div key={doc.id} className="mh-table-row">
                  <div className="mh-col-name">📄 {doc.fileName || 'Document'}</div>
                  <div className="mh-col-date">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mh-col-size">N/A</div>
                  <div className="mh-col-actions">
                    <button className="mh-btn-download">📥 Download</button>
                    <button 
                      className="mh-btn-delete"
                      onClick={() => handleDelete(doc.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
