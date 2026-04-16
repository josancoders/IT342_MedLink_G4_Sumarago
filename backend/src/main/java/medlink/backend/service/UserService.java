package medlink.backend.service;

import medlink.backend.dto.AuthResponse;
import medlink.backend.dto.LoginRequest;
import medlink.backend.dto.RegisterRequest;
import medlink.backend.entity.User;
import medlink.backend.repository.UserRepository;
import medlink.backend.util.JwtProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client-id}")
    private String googleClientId;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
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
        
        // Generate JWT token
        String token = jwtProvider.generateToken(saved.getEmail());

        return new AuthResponse(true, "Registration successful.", saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole(), token);
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return new AuthResponse(false, "Invalid email or password.");
        }

        User user = optionalUser.get();

        // Google-only accounts cannot log in with a password
        if ("google".equals(user.getProvider())) {
            return new AuthResponse(false, "This account uses Google sign-in. Please use 'Sign in with Google'.");
        }

        // Verify the raw password against the stored hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Invalid email or password.");
        }

        // Generate JWT token
        String token = jwtProvider.generateToken(user.getEmail());

        return new AuthResponse(true, "Login successful.", user.getId(), user.getFullName(), user.getEmail(), user.getRole(), token);
    }

    @SuppressWarnings("unchecked")
    public AuthResponse googleLogin(String idToken) {
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            Map<String, Object> tokenInfo = restTemplate.getForObject(url, Map.class);

            if (tokenInfo == null || tokenInfo.containsKey("error")) {
                return new AuthResponse(false, "Invalid Google token.");
            }

            // Validate the token audience matches our client ID
            String aud = (String) tokenInfo.get("aud");
            if (!googleClientId.equals(aud)) {
                return new AuthResponse(false, "Token audience mismatch.");
            }

            String email = (String) tokenInfo.get("email");
            String name  = (String) tokenInfo.get("name");

            if (email == null) {
                return new AuthResponse(false, "Google account has no email.");
            }

            // Find existing user or create a new one
            Optional<User> existing = userRepository.findByEmail(email);
            User user;
            if (existing.isPresent()) {
                user = existing.get();
            } else {
                // Store a random BCrypt hash so password_hash is never null
                String unusablePassword = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
                User newUser = new User(name != null ? name : email, email, unusablePassword);
                newUser.setProvider("google");
                user = userRepository.save(newUser);
            }

            // Generate JWT token
            String token = jwtProvider.generateToken(user.getEmail());

            return new AuthResponse(true, "Google login successful.", user.getId(), user.getFullName(), user.getEmail(), user.getRole(), token);
        } catch (Exception e) {
            return new AuthResponse(false, "Google authentication failed: " + e.getMessage());
        }
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
