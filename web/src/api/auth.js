import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// Auth
export const registerUser = (data) =>
  axios.post(`${API_BASE}/auth/register`, data);

export const loginUser = (data) =>
  axios.post(`${API_BASE}/auth/login`, data);

export const googleLogin = (idToken) =>
  axios.post(`${API_BASE}/auth/google`, { idToken });

// Doctors
export const getAllDoctors = () =>
  axios.get(`${API_BASE}/doctors`);

export const getDoctorById = (id) =>
  axios.get(`${API_BASE}/doctors/${id}`);

export const searchDoctors = (specialization) =>
  axios.get(`${API_BASE}/doctors/search/specialization?specialization=${specialization}`);

// Appointments
export const createAppointment = (data, token) =>
  axios.post(`${API_BASE}/appointments`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getMyAppointments = (token) =>
  axios.get(`${API_BASE}/appointments`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAppointmentById = (id, token) =>
  axios.get(`${API_BASE}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateAppointment = (id, data, token) =>
  axios.put(`${API_BASE}/appointments/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const cancelAppointment = (id, token) =>
  axios.delete(`${API_BASE}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Prescriptions
export const getPrescriptions = (token) =>
  axios.get(`${API_BASE}/prescriptions`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getPrescriptionById = (id, token) =>
  axios.get(`${API_BASE}/prescriptions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Medical Documents
export const getMedicalDocuments = (token) =>
  axios.get(`${API_BASE}/medical-documents`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const uploadMedicalDocument = (file, fileName, token) => {
  const formData = new FormData();
  formData.append('file', file);
  if (fileName) formData.append('fileName', fileName);
  
  return axios.post(`${API_BASE}/medical-documents/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteMedicalDocument = (id, token) =>
  axios.delete(`${API_BASE}/medical-documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
