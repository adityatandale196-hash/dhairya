package com.dhairya.backend.model;

public record RegisterRequest(String name, String email, String phone, String password) {
}
