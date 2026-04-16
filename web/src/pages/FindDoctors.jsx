import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../styles/FindDoctors.css';

export default function FindDoctors() {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [user, setUser] = useState(null);

  const specialties = [
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedist',
    'General Practitioner',
    'Psychiatrist',
    'Ophthalmologist'
  ];

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(stored));
    loadDoctors();
  }, [navigate]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data);
        setError(null);
      } else {
        setError('Failed to load doctors.');
      }
    } catch (err) {
      setError('Failed to load doctors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterDoctors(value, selectedSpecialty, priceRange);
  };

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialty(specialty);
    filterDoctors(searchTerm, specialty, priceRange);
  };

  const handlePriceChange = (range) => {
    setPriceRange(range);
    filterDoctors(searchTerm, selectedSpecialty, range);
  };

  const filterDoctors = (search, specialty, range) => {
    let filtered = doctors;

    if (search) {
      filtered = filtered.filter(doc =>
        doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (specialty) {
      filtered = filtered.filter(doc =>
        doc.specialization.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    filtered = filtered.filter(doc =>
      doc.consultationFee >= range[0] && doc.consultationFee <= range[1]
    );

    setFilteredDoctors(filtered);
  };

  const DoctorCard = ({ doctor }) => (
    <div className="fd-doctor-card">
      <div className="fd-doctor-avatar">{doctor.fullName.split(' ').map(n => n[0]).join('')}</div>
      <h3>{doctor.fullName}</h3>
      <p className="fd-specialty">{doctor.specialization}</p>
      <p className="fd-fee">💰 {doctor.consultationFee ? `$${doctor.consultationFee}` : 'N/A'}/session</p>
      <p className="fd-bio">{doctor.bio ? doctor.bio.substring(0, 100) + '...' : 'Experienced healthcare professional'}</p>
      <Link to={`/doctors/${doctor.id}`} className="fd-btn-detail">View Profile</Link>
      <Link to={`/book-appointment/${doctor.id}`} className="fd-btn-book">Book Appointment</Link>
    </div>
  );

  const SkeletonCard = () => (
    <div className="fd-doctor-card fd-skeleton">
      <div className="fd-skeleton-avatar"></div>
      <div className="fd-skeleton-line"></div>
      <div className="fd-skeleton-line short"></div>
      <div className="fd-skeleton-line short"></div>
    </div>
  );

  return (
    <div className="fd-root">
      {/* Left Sidebar */}
      <aside className="fd-sidebar">
        <div className="fd-logo">MedLink</div>
        <nav className="fd-nav">
          <Link to="/dashboard" className="fd-nav-item">⊞ Dashboard</Link>
          <Link to="/find-doctors" className="fd-nav-item active">🔍 Find Doctors</Link>
          <Link to="/appointments" className="fd-nav-item">📋 My Appointments</Link>
          <Link to="/medical-history" className="fd-nav-item">📄 Medical History</Link>
          <Link to="/prescriptions" className="fd-nav-item">💊 Prescriptions</Link>
        </nav>
        <button className="fd-logout" onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}>→ Logout</button>
      </aside>

      {/* Main Content */}
      <div className="fd-main">
        <header className="fd-header">
          <div className="fd-search-wrap">
            <span className="fd-search-icon">🔍</span>
            <input
              className="fd-search"
              placeholder="Search Doctor..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <div className="fd-header-right">
            <Link to="/appointments" className="fd-appt-btn">📋 Appointments</Link>
            {user && (
              <>
                <div className="fd-avatar">
                  {user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </div>
                <span className="fd-username">{user.name}</span>
              </>
            )}
          </div>
        </header>

        <main className="fd-content">
          <div className="fd-container">
            {/* Sidebar Filters */}
            <aside className="fd-filters">
              <h3>Filters</h3>
              
              <div className="fd-filter-group">
                <label className="fd-filter-label">Specialty</label>
                <div className="fd-specialty-list">
                  <button
                    className={`fd-filter-btn ${selectedSpecialty === '' ? 'active' : ''}`}
                    onClick={() => handleSpecialtyChange('')}
                  >
                    All
                  </button>
                  {specialties.map(sp => (
                    <button
                      key={sp}
                      className={`fd-filter-btn ${selectedSpecialty === sp ? 'active' : ''}`}
                      onClick={() => handleSpecialtyChange(sp)}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fd-filter-group">
                <label className="fd-filter-label">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={priceRange[1]}
                  onChange={e => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                  className="fd-slider"
                />
              </div>

              <button className="fd-clear-filters" onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('');
                setPriceRange([0, 300]);
                setFilteredDoctors(doctors);
              }}>Clear Filters</button>
            </aside>

            {/* Doctors Grid */}
            <section className="fd-doctors-section">
              {error && (
                <div className="fd-error">
                  {error}
                  <button onClick={loadDoctors} style={{ marginLeft: '10px', padding: '6px 12px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Retry</button>
                </div>
              )}

              {!loading && filteredDoctors.length === 0 && !error && (
                <div className="fd-empty">
                  No doctors found matching your criteria
                </div>
              )}

              {loading && (
                <div className="fd-loading">
                  Loading doctors...
                </div>
              )}

              <div className="fd-doctors-grid">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  filteredDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
