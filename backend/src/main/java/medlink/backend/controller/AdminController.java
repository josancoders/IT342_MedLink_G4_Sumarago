package medlink.backend.controller;

import medlink.backend.dto.AuthResponse;
import medlink.backend.dto.CreateDoctorRequest;
import medlink.backend.entity.User;
import medlink.backend.entity.Doctor;
import medlink.backend.repository.UserRepository;
import medlink.backend.repository.DoctorRepository;
import medlink.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final DoctorRepository doctorRepository;

    public AdminController(UserRepository userRepository, UserService userService, DoctorRepository doctorRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.doctorRepository = doctorRepository;
    }

    // Get all users (admin only)
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        List<User> users = userRepository.findAll();
        
        List<Map<String, Object>> usersList = users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            userMap.put("provider", user.getProvider());
            userMap.put("createdAt", user.getCreatedAt());
            return userMap;
        }).toList();
        
        return ResponseEntity.ok(usersList);
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(false, "User not found"));
        }
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.get().getId());
        userMap.put("name", user.get().getFullName());
        userMap.put("email", user.get().getEmail());
        userMap.put("role", user.get().getRole());
        userMap.put("provider", user.get().getProvider());
        userMap.put("createdAt", user.get().getCreatedAt());
        
        return ResponseEntity.ok(userMap);
    }

    // Update user role
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        
        if (newRole == null || (!newRole.equals("ADMIN") && !newRole.equals("DOCTOR") && !newRole.equals("PATIENT"))) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid role"));
        }
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(false, "User not found"));
        }
        
        User user = userOpt.get();
        user.setRole(newRole);
        userRepository.save(user);
        
        return ResponseEntity.ok(new AuthResponse(true, "User role updated successfully"));
    }

    // Deactivate/Delete user (soft delete or hard delete)
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(false, "User not found"));
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(new AuthResponse(true, "User deleted successfully"));
    }

    // Create doctor account (admin only)
    @PostMapping("/doctors/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDoctorAccount(@Valid @RequestBody CreateDoctorRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Email already registered"));
        }
        
        // Create new doctor user
        User doctor = new User(
            request.getName(),
            request.getEmail(),
            userService.encodePassword(request.getPassword()),
            "DOCTOR"
        );
        
        User savedDoctor = userRepository.save(doctor);
        
        // Create associated Doctor entity with empty professional fields
        Doctor doctorProfile = new Doctor();
        doctorProfile.setUser(savedDoctor);
        doctorProfile.setSpecialization("");
        doctorProfile.setPhone("");
        doctorProfile.setLocation("");
        doctorProfile.setLanguages("");
        doctorProfile.setEducation("");
        doctorProfile.setBio("");
        doctorRepository.save(doctorProfile);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Doctor account created successfully");
        response.put("doctorId", savedDoctor.getId());
        response.put("email", savedDoctor.getEmail());
        response.put("name", savedDoctor.getFullName());
        response.put("role", savedDoctor.getRole());
        
        return ResponseEntity.ok(response);
    }

    // Get statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatistics() {
        long totalUsers = userRepository.count();
        long totalPatients = userRepository.findAll().stream()
            .filter(u -> u.getRole().equals("PATIENT")).count();
        long totalDoctors = userRepository.findAll().stream()
            .filter(u -> u.getRole().equals("DOCTOR")).count();
        long totalAdmins = userRepository.findAll().stream()
            .filter(u -> u.getRole().equals("ADMIN")).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalAdmins", totalAdmins);
        
        return ResponseEntity.ok(stats);
    }
}
