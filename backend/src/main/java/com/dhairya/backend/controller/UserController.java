package com.dhairya.backend.controller;

import com.dhairya.backend.model.LoginRequest;
import com.dhairya.backend.model.RegisterRequest;
import com.dhairya.backend.model.User;
import com.dhairya.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ================== REGISTER ==================
    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody RegisterRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            return error(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (req.email() == null || req.email().isBlank() || !req.email().contains("@")) {
            return error(HttpStatus.BAD_REQUEST, "Valid email is required");
        }
        if (req.password() == null || req.password().length() < 6) {
            return error(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }

        String normalizedEmail = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            return error(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(req.phone() == null ? null : req.phone().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setToken(newToken());

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("user", saved, "token", saved.getToken())
        );
    }

    // ================== LOGIN ==================
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest req) {
        if (req.email() == null || req.password() == null) {
            return error(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        Optional<User> found = userRepository.findByEmail(req.email().trim().toLowerCase());
        if (found.isEmpty()) {
            return error(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        User user = found.get();

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            return error(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // Ensure user has a token (older accounts won't)
        if (user.getToken() == null || user.getToken().isBlank()) {
            user.setToken(newToken());
            userRepository.save(user);
        }

        return ResponseEntity.ok(
                Map.of("user", user, "token", user.getToken())
        );
    }

    // ================== HELPERS ==================
    private String newToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private ResponseEntity<Object> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(
                Map.of("success", false, "message", message)
        );
    }
}