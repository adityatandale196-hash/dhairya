package com.dhairya.backend.model;

public record TripRequest(
        String destination,
        Integer expectedMinutes,
        Double latitude,
        Double longitude
) {}