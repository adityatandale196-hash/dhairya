package com.dhairya.backend.controller;

import com.dhairya.backend.model.Alert;
import com.dhairya.backend.model.SosRequest;
import com.dhairya.backend.repository.AlertRepository;
import com.dhairya.backend.repository.ContactRepository;
import com.dhairya.backend.repository.UserRepository;
import com.dhairya.backend.service.SmsService;
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

    public AlertController(AlertRepository alertRepository,
                           UserRepository userRepository,
                           ContactRepository contactRepository,
                           SmsService smsService) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.smsService = smsService;
    }

    // Create an SOS alert
    @PostMapping("/sos")
    public ResponseEntity<Object> sos(@RequestBody SosRequest req) {
        return createAlert("SOS", req);
    }

    // Start a Smart Safety Check
    @PostMapping("/safety-check")
    public ResponseEntity<Object> safetyCheck(@RequestBody SosRequest req) {
        return createAlert("SAFETY_CHECK", req);
    }

    // List alerts of one user (newest first)
    @GetMapping
    public List<Alert> list(@RequestParam("userId") Integer userId) {
        return alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Mark an alert as resolved ("I'm safe now")
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Object> resolve(@PathVariable("id") Integer id,
                                          @RequestParam("userId") Integer userId) {
        return updateStatus(id, userId, "RESOLVED");
    }

    // Mark an alert as escalated AND send automatic SMS to all trusted contacts
    @PutMapping("/{id}/escalate")
    public ResponseEntity<Object> escalate(@PathVariable("id") Integer id,
                                           @RequestParam("userId") Integer userId) {
        Optional<Alert> found = alertRepository.findByAlertIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Alert not found");
        }

        Alert alert = found.get();
        alert.setStatus("ESCALATED");
        alertRepository.save(alert);

        // 🔥 AUTOMATIC SMS — runs entirely on the server
        try {
            var userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                var user = userOpt.get();
                var contacts = contactRepository.findByUserId(userId);

                String mapsLink = "";
                if (alert.getLatitude() != null && alert.getLongitude() != null) {
                    mapsLink = " Location: https://maps.google.com/?q="
                            + alert.getLatitude() + "," + alert.getLongitude();
                }

                String message = "EMERGENCY ALERT from Dhairya: " + user.getName()
                        + " has triggered a safety alert and may need help."
                        + mapsLink + " Please call them immediately.";

                for (var contact : contacts) {
                    smsService.sendSms(contact.getPhone(), message);
                }
            }
        } catch (Exception e) {
            System.err.println("Auto SMS failed: " + e.getMessage());
        }

        return ResponseEntity.ok(alert);
    }

    // Update location (called periodically from the frontend)
    @PutMapping("/{id}/location")
    public ResponseEntity<Object> updateLocation(@PathVariable("id") Integer id,
                                                 @RequestParam("userId") Integer userId,
                                                 @RequestBody SosRequest req) {
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

    private ResponseEntity<Object> createAlert(String type, SosRequest req) {
        if (req.userId() == null) {
            return error(HttpStatus.BAD_REQUEST, "User id is required");
        }
        if (!userRepository.existsById(req.userId())) {
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
        alert.setUserId(req.userId());
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