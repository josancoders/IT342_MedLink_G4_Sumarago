package medlink.backend.controller;

import medlink.backend.dto.PrescriptionDTO;
import medlink.backend.entity.Prescription;
import medlink.backend.entity.User;
import medlink.backend.repository.PrescriptionRepository;
import medlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all prescriptions for current user
    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getUserPrescriptions(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        List<Prescription> prescriptions = prescriptionRepository.findByAppointmentPatientId(user.getId());
        List<PrescriptionDTO> dtos = prescriptions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get prescription by ID
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long id) {
        return prescriptionRepository.findById(id)
                .map(presc -> ResponseEntity.ok(convertToDTO(presc)))
                .orElse(ResponseEntity.notFound().build());
    }

    private PrescriptionDTO convertToDTO(Prescription presc) {
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(presc.getId());
        dto.setAppointmentId(presc.getAppointment().getId());
        dto.setDoctorName(presc.getAppointment().getDoctor().getUser().getFullName());
        dto.setMedication(presc.getMedication());
        dto.setDosage(presc.getDosage());
        dto.setFrequency(presc.getFrequency());
        dto.setDuration(presc.getDuration());
        dto.setFilePath(presc.getFilePath());
        return dto;
    }
}
