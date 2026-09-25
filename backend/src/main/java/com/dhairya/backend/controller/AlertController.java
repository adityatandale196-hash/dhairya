package com.dhairya.backend.controller;

import com.dhairya.backend.model.Alert;
import com.dhairya.backend.model.SosRequest;
import com.dhairya.backend.repository.AlertRepository;
import com.dhairya.backend.repository.ContactRepository;
import com.dhairya.backend.repository.UserRepository;
import com.dhairya.backend.service.EmailService;
import com.dhairya.backend.service.RateLimiter;
import com.dhairya.backend.service.SmsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final SmsService smsService;
    private final EmailService emailService;
    private final RateLimiter rateLimiter;

    public AlertController(AlertRepository alertRepository,
                           UserRepository userRepository,
                           ContactRepository contactRepository,
                           SmsService smsService,
                           EmailService emailService,
                           RateLimiter rateLimiter) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.smsService = smsService;
        this.emailService = emailService;
        this.rateLimiter = rateLimiter;
    }

    // Create an SOS alert
    @PostMapping("/sos")
    public ResponseEntity<Object> sos(@RequestBody SosRequest req, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return createAlert("SOS", userId, req);
    }

    // Start a Smart Safety Check
    @PostMapping("/safety-check")
    public ResponseEntity<Object> safetyCheck(@RequestBody SosRequest req, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return createAlert("SAFETY_CHECK", userId, req);
    }

    // List alerts of the logged-in user
    @GetMapping
    public List<Alert> list(HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Mark an alert as resolved ("I'm safe now")
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Object> resolve(@PathVariable("id") Integer id, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return updateStatus(id, userId, "RESOLVED");
    }

    // Mark as escalated AND send SMS + email to all trusted contacts
    @PutMapping("/{id}/escalate")
    public ResponseEntity<Object> escalate(@PathVariable("id") Integer id, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        // Rate limit check
        if (!rateLimiter.allow(userId)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                    Map.of("success", false, "message", "Please wait before escalating again")
            );
        }

        Optional<Alert> found = alertRepository.findByAlertIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Alert not found");
        }

        Alert alert = found.get();
        alert.setStatus("ESCALATED");
        alertRepository.save(alert);

        System.out.println("ESCALATE triggered: userId=" + userId + " alertId=" + id + " time=" + java.time.LocalDateTime.now());

        // Auto notifications: SMS + Email
        try {
            userRepository.findById(userId).ifPresent(user -> {
                var contacts = contactRepository.findByUserId(userId);

                String mapsLink = "";
                if (alert.getLatitude() != null && alert.getLongitude() != null) {
                    mapsLink = "Location: https://maps.google.com/?q="
                            + alert.getLatitude() + "," + alert.getLongitude();
                }

                String smsBody = "EMERGENCY ALERT from Dhairya: " + user.getName()
                        + " has triggered a safety alert. " + mapsLink
                        + " Please call them immediately.";

                String emailSubject = "Emergency Alert from " + user.getName();
                String emailBody = "Dear contact,\n\n"
                        + user.getName() + " has triggered an emergency alert on Dhairya.\n\n"
                        + mapsLink + "\n\n"
                        + "Please call them immediately.\n\n"
                        + "- Dhairya Safety App";

                for (var contact : contacts) {
                    smsService.sendSms(contact.getPhone(), smsBody);
                    if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                        emailService.sendEmail(contact.getEmail(), emailSubject, emailBody);
                    }
                }
            });
        } catch (Exception e) {
            System.err.println("Auto notify failed: " + e.getMessage());
        }

        return ResponseEntity.ok(alert);
    }

    // Update location (called periodically from the frontend)
    @PutMapping("/{id}/location")
    public ResponseEntity<Object> updateLocation(@PathVariable("id") Integer id,
                                                 @RequestBody SosRequest req,
                                                 HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        Optional<Alert> found = alertRepository.findByAlertIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Alert not found");
        }
        if (req.latitude() == null || req.longitude() == null) {
            return error(HttpStatus.BAD_REQUEST, "Both latitude and longitude are required");
        }
        Alert alert = found.get();
        alert.setLatitude(req.latitude());
        alert.setLongitude(req.longitude());
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    private ResponseEntity<Object> createAlert(String type, Integer userId, SosRequest req) {
        if (userId == null) {
            return error(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        if (!userRepository.existsById(userId)) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }

        boolean hasLat = req.latitude() != null;
        boolean hasLng = req.longitude() != null;

        if (hasLat != hasLng) {
            return error(HttpStatus.BAD_REQUEST, "Send both latitude and longitude, or neither");
        }
        if (hasLat && (req.latitude() < -90 || req.latitude() > 90
                || req.longitude() < -180 || req.longitude() > 180)) {
            return error(HttpStatus.BAD_REQUEST, "Invalid coordinates");
        }

        Alert alert = new Alert();
        alert.setUserId(userId);
        alert.setAlertType(type);
        alert.setLatitude(req.latitude());
        alert.setLongitude(req.longitude());
        alert.setStatus("ACTIVE");

        return ResponseEntity.status(HttpStatus.CREATED).body(alertRepository.save(alert));
    }

    private ResponseEntity<Object> updateStatus(Integer id, Integer userId, String status) {
        Optional<Alert> found = alertRepository.findByAlertIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Alert not found");
        }
        Alert alert = found.get();
        alert.setStatus(status);
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    private ResponseEntity<Object> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("success", false, "message", message));
    }
}