package medlink.backend.controller;

import medlink.backend.dto.MedicalDocumentDTO;
import medlink.backend.entity.MedicalDocument;
import medlink.backend.entity.User;
import medlink.backend.repository.MedicalDocumentRepository;
import medlink.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medical-documents")
public class MedicalDocumentController {

    @Autowired
    private MedicalDocumentRepository medicalDocumentRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all documents for current user
    @GetMapping
    public ResponseEntity<List<MedicalDocumentDTO>> getUserDocuments(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        List<MedicalDocument> documents = medicalDocumentRepository.findByUserId(user.getId());
        List<MedicalDocumentDTO> dtos = documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Upload medical document
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fileName", required = false) String fileName,
            Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String originalFileName = fileName != null ? fileName : file.getOriginalFilename();
            String filePath = "documents/" + user.getId() + "/" + System.currentTimeMillis() + "_" + originalFileName;

            MedicalDocument document = new MedicalDocument();
            document.setUser(user);
            document.setFilePath(filePath);
            document.setUploadedAt(LocalDateTime.now());

            medicalDocumentRepository.save(document);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document uploaded successfully");
            response.put("documentId", document.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("success", "false");
                put("message", e.getMessage());
            }});
        }
    }

    // Delete document
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            MedicalDocument document = medicalDocumentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            medicalDocumentRepository.delete(document);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("success", "false");
                put("message", e.getMessage());
            }});
        }
    }

    private MedicalDocumentDTO convertToDTO(MedicalDocument doc) {
        MedicalDocumentDTO dto = new MedicalDocumentDTO();
        dto.setId(doc.getId());
        dto.setFilePath(doc.getFilePath());
        dto.setCreatedAt(doc.getUploadedAt());
        String[] parts = doc.getFilePath().split("/");
        dto.setFileName(parts.length > 0 ? parts[parts.length - 1] : "document");
        return dto;
    }
}
