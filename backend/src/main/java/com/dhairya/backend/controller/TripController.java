package com.dhairya.backend.controller;

import com.dhairya.backend.model.Trip;
import com.dhairya.backend.model.TripRequest;
import com.dhairya.backend.repository.TripRepository;
import com.dhairya.backend.repository.UserRepository;
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

    public TripController(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    // Start a new journey
    @PostMapping
    public ResponseEntity<Object> start(@RequestBody TripRequest req) {
        if (req.userId() == null) {
            return error(HttpStatus.BAD_REQUEST, "User id is required");
        }
        if (!userRepository.existsById(req.userId())) {
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
        trip.setUserId(req.userId());
        trip.setDestination(req.destination());
        trip.setExpectedMinutes(req.expectedMinutes());
        trip.setLatitude(req.latitude());
        trip.setLongitude(req.longitude());
        trip.setStatus("ACTIVE");

        return ResponseEntity.status(HttpStatus.CREATED).body(tripRepository.save(trip));
    }

    // List all trips of a user (newest first)
    @GetMapping
    public List<Trip> list(@RequestParam("userId") Integer userId) {
        return tripRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Mark trip as safe ("I've reached safely")
    @PutMapping("/{id}/safe")
    public ResponseEntity<Object> markSafe(@PathVariable("id") Integer id,
                                           @RequestParam("userId") Integer userId) {
        return updateStatus(id, userId, "SAFE");
    }

    // Mark trip as escalated (contacts were alerted)
    @PutMapping("/{id}/escalate")
    public ResponseEntity<Object> escalate(@PathVariable("id") Integer id,
                                           @RequestParam("userId") Integer userId) {
        return updateStatus(id, userId, "ESCALATED");
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