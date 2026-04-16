import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FindDoctors from './pages/FindDoctors';
import DoctorDetail from './pages/DoctorDetail';
import BookAppointment from './pages/BookAppointment';
import Payment from './pages/Payment';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import MyAppointments from './pages/MyAppointments';
import MedicalHistory from './pages/MedicalHistory';
import Prescriptions from './pages/Prescriptions';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorUploadPrescription from './pages/DoctorUploadPrescription';
import DoctorProfile from './pages/DoctorProfile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/upload-prescription" element={<DoctorUploadPrescription />} />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/medical-history" element={<MedicalHistory />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
