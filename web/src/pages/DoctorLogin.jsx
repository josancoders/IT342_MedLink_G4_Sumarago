import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      if (res.data.success) {
        // Check if user is a doctor
        if (res.data.role !== 'DOCTOR') {
          setError('This portal is for doctors only. Please use the patient login.');
          setLoading(false);
          return;
        }
        localStorage.setItem('user', JSON.stringify(res.data));
        localStorage.setItem('token', res.data.token);
        
        // Check if it's first login (password needs to be changed)
        if (res.data.firstLogin || res.data.passwordTemporary) {
          setDoctorEmail(res.data.email);
          setShowPasswordModal(true);
        } else {
          navigate('/doctor');
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    navigate('/doctor');
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">MedLink Doctors</div>
          <h2>Sign In</h2>
          <p className="auth-subtitle">Enter your credentials</p>

          {error && <div className="alert alert-error">&#9888; {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal 
          onPasswordChange={handlePasswordChanged} 
          email={doctorEmail}
        />
      )}
    </>
  );
}
