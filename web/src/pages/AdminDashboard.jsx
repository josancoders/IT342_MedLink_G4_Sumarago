import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const NAV_LINKS = [
  { label: 'Admin', path: '/admin', icon: '🔐' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('users');
  const [showCreateDoctor, setShowCreateDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    specialization: '',
    consultationFee: '',
    bio: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(stored);
    
    // Check if user is admin
    if (userData.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    setUser(userData);
    loadUsers();
    loadStats();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.name || !doctorForm.email || !doctorForm.password) {
      alert('Name, Email, and Password are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/doctors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: doctorForm.name,
          email: doctorForm.email,
          password: doctorForm.password,
          specialization: doctorForm.specialization || '',
          consultationFee: doctorForm.consultationFee ? parseFloat(doctorForm.consultationFee) : 0,
          bio: doctorForm.bio || ''
        })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        alert('Doctor account created successfully! Doctor can update profile after login.');
        setDoctorForm({ name: '', email: '', password: '', specialization: '', consultationFee: '', bio: '' });
        setShowCreateDoctor(false);
        loadUsers();
      } else {
        alert(data.message || 'Failed to create doctor account');
      }
    } catch (err) {
      alert('Error creating doctor account');
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId) => {
    if (!newRole) {
      alert('Please select a role');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (data.success) {
        alert('User role updated successfully!');
        setEditingUser(null);
        setNewRole('');
        loadUsers();
      } else {
        alert(data.message || 'Failed to update role');
      }
    } catch (err) {
      alert('Error updating user role');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully!');
        loadUsers();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">🔐 MedLink Admin</div>
        <nav className="admin-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`admin-nav-item ${window.location.pathname === link.path ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <button className="admin-logout" onClick={handleLogout}>→ Logout</button>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-right">
            <div className="admin-avatar">{initials}</div>
            <span className="admin-username">{user.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {/* Statistics */}
          {stats && (
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Patients</div>
                <div className="stat-value">{stats.totalPatients}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Doctors</div>
                <div className="stat-value">{stats.totalDoctors}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Admins</div>
                <div className="stat-value">{stats.totalAdmins}</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${tab === 'users' ? 'active' : ''}`}
              onClick={() => setTab('users')}
            >
              👥 Manage Users
            </button>
            <button 
              className={`admin-tab ${tab === 'create-doctor' ? 'active' : ''}`}
              onClick={() => setTab('create-doctor')}
            >
              ➕ Create Doctor
            </button>
          </div>

          {/* Users Management Tab */}
          {tab === 'users' && (
            <div className="admin-section">
              <h2>User Management</h2>
              
              {error && <div className="admin-error">{error}</div>}
              
              {loading ? (
                <div className="admin-loading">Loading users...</div>
              ) : (
                <div className="admin-users-table">
                  <div className="table-header">
                    <div className="col-name">Name</div>
                    <div className="col-email">Email</div>
                    <div className="col-role">Role</div>
                    <div className="col-date">Registered</div>
                    <div className="col-actions">Actions</div>
                  </div>
                  {users.map(u => (
                    <div key={u.id} className="table-row">
                      <div className="col-name">{u.name}</div>
                      <div className="col-email">{u.email}</div>
                      <div className="col-role">
                        {editingUser === u.id ? (
                          <select 
                            value={newRole} 
                            onChange={(e) => setNewRole(e.target.value)}
                            className="role-select"
                          >
                            <option value="">Select Role</option>
                            <option value="ADMIN">Admin</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="PATIENT">Patient</option>
                          </select>
                        ) : (
                          <span className={`role-badge role-${u.role.toLowerCase()}`}>
                            {u.role}
                          </span>
                        )}
                      </div>
                      <div className="col-date">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                      <div className="col-actions">
                        {editingUser === u.id ? (
                          <>
                            <button 
                              className="btn-save"
                              onClick={() => handleUpdateRole(u.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="btn-cancel"
                              onClick={() => {
                                setEditingUser(null);
                                setNewRole('');
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="btn-edit"
                              onClick={() => {
                                setEditingUser(u.id);
                                setNewRole(u.role);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Doctor Tab */}
          {tab === 'create-doctor' && (
            <div className="admin-section">
              <h2>Create Doctor Account</h2>
              
              <form onSubmit={handleCreateDoctor} className="admin-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                    placeholder="Enter doctor's name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                    placeholder="Enter doctor's email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Temporary Password</label>
                  <input
                    type="password"
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                    placeholder="Enter temporary password (min. 6 chars)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specialization <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 400 }}>(Optional)</span></label>
                  <input
                    type="text"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    placeholder="e.g., Cardiologist, Neurologist, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Consultation Fee ($) <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 400 }}>(Optional)</span></label>
                  <input
                    type="number"
                    value={doctorForm.consultationFee}
                    onChange={(e) => setDoctorForm({...doctorForm, consultationFee: e.target.value})}
                    placeholder="e.g., 120"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Bio (Optional)</label>
                  <textarea
                    value={doctorForm.bio}
                    onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
                    placeholder="Brief bio about the doctor"
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn-create">Create Doctor Account</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
