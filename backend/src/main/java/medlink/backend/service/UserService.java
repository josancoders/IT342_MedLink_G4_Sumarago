package medlink.backend.service;

import medlink.backend.dto.AuthResponse;
import medlink.backend.dto.LoginRequest;
import medlink.backend.dto.RegisterRequest;
import medlink.backend.entity.User;
import medlink.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email is already registered.");
        }

        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(request.getName(), request.getEmail(), hashedPassword);
        User saved = userRepository.save(user);

        return new AuthResponse(true, "Registration successful.", saved.getId(), saved.getFullName(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return new AuthResponse(false, "Invalid email or password.");
        }

        User user = optionalUser.get();

        // Verify the raw password against the stored hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Invalid email or password.");
        }

        return new AuthResponse(true, "Login successful.", user.getId(), user.getFullName(), user.getEmail());
    }
}
