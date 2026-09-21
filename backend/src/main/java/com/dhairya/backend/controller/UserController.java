package com.dhairya.backend.controller;

import com.dhairya.backend.model.LoginRequest;
import com.dhairya.backend.model.RegisterRequest;
import com.dhairya.backend.model.User;
import com.dhairya.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest req) {

        if (req.name() == null || req.name().isBlank()
                || req.email() == null || req.email().isBlank()
                || req.password() == null || req.password().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Name, email and a password of at least 6 characters are required"));
        }

        String email = req.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", "This email is already registered"));
        }

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPhone(req.phone());
        user.setPassword(encoder.encode(req.password()));

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest req) {

        if (req.email() == null || req.email().isBlank()
                || req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email and password are required"));
        }

        Optional<User> found = userRepository.findByEmail(req.email().trim().toLowerCase());

        if (found.isEmpty() || !encoder.matches(req.password(), found.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"));
        }

        User user = found.get();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login successful",
                "user", Map.of(
                        "userId", user.getUserId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "phone", user.getPhone() == null ? "" : user.getPhone())));
    }
}