package medlink.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column
    private String specialization;

    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column
    private String phone;

    @Column
    private String location;

    @Column
    private String languages;

    @Column
    private String education;

    @Column(columnDefinition = "TEXT")
    private String availableSchedule;

    @Column(nullable = false)
    private Boolean active = false;

    public Doctor() {}

    public Doctor(User user, String specialization, BigDecimal consultationFee, String bio) {
        this.user = user;
        this.specialization = specialization;
        this.consultationFee = consultationFee;
        this.bio = bio;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getAvailableSchedule() { return availableSchedule; }
    public void setAvailableSchedule(String availableSchedule) { this.availableSchedule = availableSchedule; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
