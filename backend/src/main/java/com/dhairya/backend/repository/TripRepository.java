package com.dhairya.backend.repository;

import com.dhairya.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Integer> {

    List<Trip> findByUserIdOrderByCreatedAtDesc(Integer userId);

    Optional<Trip> findByTripIdAndUserId(Integer tripId, Integer userId);
}