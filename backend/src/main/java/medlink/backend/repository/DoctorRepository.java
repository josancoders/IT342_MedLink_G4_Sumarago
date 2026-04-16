package medlink.backend.repository;

import medlink.backend.entity.Doctor;
import medlink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByUser(User user);
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
}
