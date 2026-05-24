package medlink.backend.repository;

import medlink.backend.entity.Appointment;
import medlink.backend.entity.Doctor;
import medlink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByStatus(String status);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate appointmentDate, String status);
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(Long doctorId, LocalDate appointmentDate, String timeSlot, String status);
}
