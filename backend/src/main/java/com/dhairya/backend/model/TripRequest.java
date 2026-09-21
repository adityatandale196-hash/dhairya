package com.dhairya.backend.model;

public record TripRequest(
        Integer userId,
        String destination,
        Integer expectedMinutes,
        Double latitude,
        Double longitude
) {}