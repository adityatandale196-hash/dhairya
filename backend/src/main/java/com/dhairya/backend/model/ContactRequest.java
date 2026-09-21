package com.dhairya.backend.model;

public record ContactRequest(Integer userId, String name, String phone, String relationship) {
}