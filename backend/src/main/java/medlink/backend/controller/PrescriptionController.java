package medlink.backend.controller;

import medlink.backend.dto.PrescriptionDTO;
import medlink.backend.entity.Appointment;
import medlink.backend.entity.Prescription;
import medlink.backend.entity.User;
import medlink.backend.repository.AppointmentRepository;
import medlink.backend.repository.PrescriptionRepository;
import medlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private final String UPLOAD_DIR = "uploads/prescriptions/";

    // Upload prescription file
    @PostMapping("/upload")
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestParam("appointmentId") Long appointmentId,
            Authentication auth) {

        try {
            // Find appointment
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found");
            }
            Appointment appointment = appointmentOpt.get();

            // Validate file type - accept common documents and images
            String contentType = file.getContentType();
            String[] allowedTypes = {
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "application/msword", // .doc
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                "application/vnd.ms-excel", // .xls
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                "text/plain", // .txt
                "text/csv" // .csv
            };
            
            boolean isAllowed = false;
            if (contentType != null) {
                for (String allowed : allowedTypes) {
                    if (contentType.equals(allowed)) {
                        isAllowed = true;
                        break;
                    }
                }
            }
            
            if (!isAllowed) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("File type not allowed. Accepted: PDF, Images (JPG, PNG, GIF, WebP), Documents (DOC, DOCX), Spreadsheets (XLS, XLSX), Text (TXT, CSV)");
            }

            // Create directory if not exists
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Generate unique file name
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR + fileName);

            // Save file
            Files.write(filePath, file.getBytes());

            // Create or update prescription
            Prescription prescription = prescriptionRepository.findByAppointment(appointment).orElse(new Prescription());
            prescription.setAppointment(appointment);
            prescription.setFilePath(fileName);
            // Default text since we are uploading a document
            prescription.setMedication("Prescription Document");
            prescription.setDosage("See attached file");
            prescription.setFrequency("See attached file");
            prescription.setDuration("See attached file");

            prescriptionRepository.save(prescription);

            return ResponseEntity.ok("Prescription uploaded successfully");

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }
    
    // Download prescription file
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadPrescriptionFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                // Determine content type based on file extension
                String contentType = "application/octet-stream";
                if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

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
