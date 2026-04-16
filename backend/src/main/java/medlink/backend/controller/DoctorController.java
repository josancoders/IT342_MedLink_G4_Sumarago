package medlink.backend.controller;

import medlink.backend.dto.DoctorDTO;
import medlink.backend.entity.Doctor;
import medlink.backend.entity.User;
import medlink.backend.repository.DoctorRepository;
import medlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all doctors
    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<DoctorDTO> doctorDTOs = doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctorDTOs);
    }

    // Get doctors by specialization
    @GetMapping("/search/specialization")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(
            @RequestParam String specialization) {
        List<Doctor> doctors = doctorRepository.findBySpecializationContainingIgnoreCase(specialization);
        List<DoctorDTO> doctorDTOs = doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctorDTOs);
    }

    // Get doctor by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<DoctorDTO> getDoctorByUserId(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .flatMap(user -> doctorRepository.findByUser(user)
                        .map(doctor -> ResponseEntity.ok(convertToDTO(doctor))))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
        return doctorRepository.findById(id)
                .map(doctor -> ResponseEntity.ok(convertToDTO(doctor)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new doctor profile for a user
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createDoctorProfile(@PathVariable Long userId, @RequestBody DoctorDTO doctorDTO) {
        return userRepository.findById(userId)
                .map(user -> {
                    // Check if doctor profile already exists
                    if (doctorRepository.findByUser(user).isPresent()) {
                        return ResponseEntity.badRequest().body(new java.util.HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Doctor profile already exists for this user");
                        }});
                    }
                    
                    // Create new doctor profile
                    Doctor doctor = new Doctor();
                    doctor.setUser(user);
                    doctor.setPhone(doctorDTO.getPhone() != null ? doctorDTO.getPhone() : "");
                    doctor.setSpecialization(doctorDTO.getSpecialization() != null ? doctorDTO.getSpecialization() : "");
                    doctor.setConsultationFee(doctorDTO.getConsultationFee());
                    doctor.setLocation(doctorDTO.getLocation() != null ? doctorDTO.getLocation() : "");
                    doctor.setLanguages(doctorDTO.getLanguages() != null ? doctorDTO.getLanguages() : "");
                    doctor.setEducation(doctorDTO.getEducation() != null ? doctorDTO.getEducation() : "");
                    doctor.setBio(doctorDTO.getBio() != null ? doctorDTO.getBio() : "");
                    
                    Doctor saved = doctorRepository.save(doctor);
                    return ResponseEntity.ok(convertToDTO(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update doctor profile
    @PutMapping("/{id}")
    public ResponseEntity<DoctorDTO> updateDoctor(@PathVariable Long id, @RequestBody DoctorDTO doctorDTO) {
        return doctorRepository.findById(id)
                .map(doctor -> {
                    if (doctorDTO.getPhone() != null) doctor.setPhone(doctorDTO.getPhone());
                    if (doctorDTO.getSpecialization() != null) doctor.setSpecialization(doctorDTO.getSpecialization());
                    if (doctorDTO.getConsultationFee() != null) doctor.setConsultationFee(doctorDTO.getConsultationFee());
                    if (doctorDTO.getLocation() != null) doctor.setLocation(doctorDTO.getLocation());
                    if (doctorDTO.getLanguages() != null) doctor.setLanguages(doctorDTO.getLanguages());
                    if (doctorDTO.getEducation() != null) doctor.setEducation(doctorDTO.getEducation());
                    if (doctorDTO.getBio() != null) doctor.setBio(doctorDTO.getBio());
                    Doctor updated = doctorRepository.save(doctor);
                    return ResponseEntity.ok(convertToDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Helper method to convert Doctor to DTO
    private DoctorDTO convertToDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setFullName(doctor.getUser().getFullName());
        dto.setEmail(doctor.getUser().getEmail());
        dto.setPhone(doctor.getPhone());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setLocation(doctor.getLocation());
        dto.setLanguages(doctor.getLanguages());
        dto.setEducation(doctor.getEducation());
        dto.setBio(doctor.getBio());
        dto.setAvailableSchedule(doctor.getAvailableSchedule());
        return dto;
    }

    // Get doctor's available schedule
    @GetMapping("/{doctorId}/available-schedule")
    public ResponseEntity<?> getAvailableSchedule(@PathVariable Long doctorId) {
        return doctorRepository.findById(doctorId)
                .map(doctor -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("doctorId", doctor.getId());
                    response.put("availableSchedule", doctor.getAvailableSchedule());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update doctor's available schedule (doctor only)
    @PutMapping("/{doctorId}/available-schedule")
    public ResponseEntity<?> updateAvailableSchedule(@PathVariable Long doctorId, @RequestBody Map<String, Object> body) {
        return doctorRepository.findById(doctorId)
                .map(doctor -> {
                    Object scheduleObj = body.get("availableSchedule");
                    String scheduleJson = scheduleObj != null ? scheduleObj.toString() : "";
                    doctor.setAvailableSchedule(scheduleJson);
                    doctorRepository.save(doctor);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Schedule updated successfully");
                    response.put("availableSchedule", doctor.getAvailableSchedule());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
