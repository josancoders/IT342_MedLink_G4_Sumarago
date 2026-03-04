package medlink.backend.repository;

import medlink.backend.entity.Appointment;
import medlink.backend.entity.Doctor;
import medlink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByStatus(String status);
}
