package medlink.backend.controller;

import medlink.backend.dto.AppointmentDTO;
import medlink.backend.entity.Appointment;
import medlink.backend.entity.Doctor;
import medlink.backend.entity.User;
import medlink.backend.repository.AppointmentRepository;
import medlink.backend.repository.DoctorRepository;
import medlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import medlink.backend.service.EmailService;

import java.time.LocalDate;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Create new appointment
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentDTO dto, Authentication auth) {
        try {
            User patient = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            // Prevent booking if doctor is not active/visible to patients
            if (doctor.getActive() == null || !doctor.getActive()) {
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("success", "false");
                    put("message", "This doctor is not accepting appointments at this time.");
                }});
            }

            boolean slotTaken = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                doctor.getId(),
                dto.getAppointmentDate(),
                dto.getTimeSlot(),
                "CANCELLED"
            );

            if (slotTaken) {
            return ResponseEntity.status(409).body(new HashMap<String, String>() {{
                put("success", "false");
                put("message", "This time slot is already taken. Please choose another time.");
            }});
            }

            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setAppointmentDate(dto.getAppointmentDate());
            appointment.setTimeSlot(dto.getTimeSlot());
            appointment.setReason(dto.getReason());
            appointment.setStatus("PENDING");

            Appointment saved;
            try {
                saved = appointmentRepository.save(appointment);
            } catch (DataIntegrityViolationException dive) {
                return ResponseEntity.status(409).body(new HashMap<String, String>() {{
                    put("success", "false");
                    put("message", "This time slot is already taken. Please choose another time.");
                }});
            }

            // send confirmation email to patient (non-blocking)
            try {
                String info = String.format("Doctor: %s\nDate: %s\nTime: %s", doctor.getUser().getFullName(), saved.getAppointmentDate(), saved.getTimeSlot());
                emailService.sendAppointmentConfirmation(patient.getEmail(), info);
            } catch (Exception ex) {
                // EmailService already swallows send errors; log for visibility
                System.err.println("Failed to queue appointment email: " + ex.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment booked successfully");
            response.put("appointmentId", saved.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("success", "false");
                put("message", e.getMessage());
            }});
        }
    }

    // Get all appointments for current user (patient)
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getUserAppointments(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        List<Appointment> appointments = appointmentRepository.findByPatientId(user.getId());
        List<AppointmentDTO> dtos = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get all appointments for current doctor
    @GetMapping("/doctor/my-appointments")
    public ResponseEntity<List<AppointmentDTO>> getDoctorAppointments(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
        if (doctor == null) return ResponseEntity.notFound().build();

        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctor.getId());
        List<AppointmentDTO> dtos = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get booked time slots for a doctor on a given date
    @GetMapping("/doctor/{doctorId}/booked-slots")
    public ResponseEntity<List<String>> getBookedTimeSlots(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date) {
        List<String> slots = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusNot(doctorId, date, "CANCELLED")
                .stream()
                .map(Appointment::getTimeSlot)
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(slots);
    }

    // Get doctor's appointment count
    @GetMapping("/doctor/stats")
    public ResponseEntity<?> getDoctorStats(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
        if (doctor == null) return ResponseEntity.notFound().build();

        List<Appointment> allAppointments = appointmentRepository.findByDoctorId(doctor.getId());
        
        LocalDate today = LocalDate.now();
        long todayCount = allAppointments.stream()
                .filter(apt -> apt.getAppointmentDate().equals(today))
                .count();
        
        long completedCount = allAppointments.stream()
                .filter(apt -> "COMPLETED".equals(apt.getStatus()))
                .count();
        
        long pendingCount = allAppointments.stream()
                .filter(apt -> "CONFIRMED".equals(apt.getStatus()) || "PENDING_PAYMENT".equals(apt.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", allAppointments.size());
        stats.put("today", todayCount);
        stats.put("completed", completedCount);
        stats.put("pending", pendingCount);
        return ResponseEntity.ok(stats);
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appt -> ResponseEntity.ok(convertToDTO(appt)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Update appointment status
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDTO dto) {
        try {
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            if (dto.getStatus() != null) {
                appointment.setStatus(dto.getStatus());
            }
            if (dto.getReason() != null) {
                appointment.setReason(dto.getReason());
            }

            appointmentRepository.save(appointment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("success", "false");
                put("message", e.getMessage());
            }});
        }
    }

    // Cancel appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
            appointment.setStatus("CANCELLED");
            appointmentRepository.save(appointment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment cancelled");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("success", "false");
                put("message", e.getMessage());
            }});
        }
    }

    private AppointmentDTO convertToDTO(Appointment appt) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appt.getId());
        dto.setDoctorId(appt.getDoctor().getId());
        dto.setDoctorName(appt.getDoctor().getUser().getFullName());
        dto.setSpecialization(appt.getDoctor().getSpecialization());
        dto.setPatientId(appt.getPatient().getId());
        dto.setPatientName(appt.getPatient().getFullName());
        dto.setAppointmentDate(appt.getAppointmentDate());
        dto.setTimeSlot(appt.getTimeSlot());
        dto.setStatus(appt.getStatus());
        dto.setReason(appt.getReason());
        return dto;
    }
}
