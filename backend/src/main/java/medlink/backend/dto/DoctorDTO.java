package medlink.backend.dto;

import java.math.BigDecimal;

public class DoctorDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private BigDecimal consultationFee;
    private String location;
    private String languages;
    private String education;
    private String bio;
    private String availableSchedule;

    public DoctorDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvailableSchedule() { return availableSchedule; }
    public void setAvailableSchedule(String availableSchedule) { this.availableSchedule = availableSchedule; }
}
