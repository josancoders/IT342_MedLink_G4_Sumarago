package medlink.backend.dto;

import java.time.LocalDateTime;

public class MedicalDocumentDTO {
    private Long id;
    private String fileName;
    private String filePath;
    private LocalDateTime createdAt;

    public MedicalDocumentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
