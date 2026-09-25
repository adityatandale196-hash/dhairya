package com.dhairya.backend.model;

public record ContactRequest(
        String name,
        String phone,
        String email,
        String relationship
) {}