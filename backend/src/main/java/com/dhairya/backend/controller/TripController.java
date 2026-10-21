package com.dhairya.backend.controller;

import com.dhairya.backend.model.Trip;
import com.dhairya.backend.model.TripRequest;
import com.dhairya.backend.repository.ContactRepository;
import com.dhairya.backend.repository.TripRepository;
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
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final SmsService smsService;
    private final EmailService emailService;
    private final RateLimiter rateLimiter;

    public TripController(TripRepository tripRepository,
                          UserRepository userRepository,
                          ContactRepository contactRepository,
                          SmsService smsService,
                          EmailService emailService,
                          RateLimiter rateLimiter) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.smsService = smsService;
        this.emailService = emailService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping
    public ResponseEntity<Object> start(@RequestBody TripRequest req, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        if (userId == null) {
            return error(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        if (!userRepository.existsById(userId)) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }
        if (req.destination() == null || req.destination().isBlank()) {
            return error(HttpStatus.BAD_REQUEST, "Destination is required");
        }
        if (req.expectedMinutes() == null || req.expectedMinutes() < 1) {
            return error(HttpStatus.BAD_REQUEST, "Expected travel time must be at least 1 minute");
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

        Trip trip = new Trip();
        trip.setUserId(userId);
        trip.setDestination(req.destination());
        trip.setExpectedMinutes(req.expectedMinutes());
        trip.setLatitude(req.latitude());
        trip.setLongitude(req.longitude());
        trip.setStatus("ACTIVE");

        return ResponseEntity.status(HttpStatus.CREATED).body(tripRepository.save(trip));
    }

    @GetMapping
    public List<Trip> list(HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return tripRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/{id}/safe")
    public ResponseEntity<Object> markSafe(@PathVariable("id") Integer id, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return updateStatus(id, userId, "SAFE");
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<Object> escalate(@PathVariable("id") Integer id, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        if (!rateLimiter.allow(userId)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                    Map.of("success", false, "message", "Please wait before escalating again")
            );
        }

        Optional<Trip> found = tripRepository.findByTripIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Trip not found");
        }

        Trip trip = found.get();
        trip.setStatus("ESCALATED");
        tripRepository.save(trip);

        System.out.println("ESCALATE triggered: userId=" + userId + " tripId=" + id + " time=" + java.time.LocalDateTime.now());

        try {
            userRepository.findById(userId).ifPresent(user -> {
                var contacts = contactRepository.findByUserId(userId);

                // 1. Build Email Body (URLs are safe here)
                String mapsLink = "";
                if (trip.getLatitude() != null && trip.getLongitude() != null) {
                    mapsLink = "Last known location: https://maps.google.com/?q="
                            + trip.getLatitude() + "," + trip.getLongitude();
                }

                String emailSubject = "Travel Alert from " + user.getName();
                String emailBody = "Dear contact,\n\n"
                        + user.getName() + " was travelling to " + trip.getDestination()
                        + " and has not confirmed reaching safely.\n\n"
                        + mapsLink + "\n\n"
                        + "Please call them now.\n\n"
                        + "- Dhairya Safety App";

                // 2. Build SMS Body (Neutral, no URLs, to bypass carrier filters)
                String smsBody = "Dhairya: " + user.getName() + " travelling to " + trip.getDestination();
                if (trip.getLatitude() != null && trip.getLongitude() != null) {
                    smsBody += ". Lat " + trip.getLatitude() + ", Lng " + trip.getLongitude();
                }

                boolean first = true;
                for (var contact : contacts) {
                    if (!first) {
                        try {
                            Thread.sleep(10_000);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                    first = false;

                    smsService.sendSms(contact.getPhone(), smsBody);
                    if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                        emailService.sendEmail(contact.getEmail(), emailSubject, emailBody);
                    }
                }
            });
        } catch (Exception e) {
            System.err.println("Auto notify failed: " + e.getMessage());
        }

        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<Object> updateLocation(@PathVariable("id") Integer id,
                                                 @RequestBody TripRequest req,
                                                 HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        Optional<Trip> found = tripRepository.findByTripIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Trip not found");
        }
        if (req.latitude() == null || req.longitude() == null) {
            return error(HttpStatus.BAD_REQUEST, "Both latitude and longitude are required");
        }
        Trip trip = found.get();
        trip.setLatitude(req.latitude());
        trip.setLongitude(req.longitude());
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    private ResponseEntity<Object> updateStatus(Integer id, Integer userId, String status) {
        Optional<Trip> found = tripRepository.findByTripIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Trip not found");
        }
        Trip trip = found.get();
        trip.setStatus(status);
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    private ResponseEntity<Object> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("success", false, "message", message));
    }
}