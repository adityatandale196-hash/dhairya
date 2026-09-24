package com.dhairya.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class SmsService {

    private static final String SMS_URL = "https://www.circuitdigest.cloud/api/v1/sms/send";
    private static final int TEMPLATE_ID = 110;

    @Value("${circuitdigest.api.key}")
    private String apiKey;

    @Value("${circuitdigest.phone.number}")
    private String verifiedPhoneNumber;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public boolean sendSms(String toNumber, String message) {
        try {
            String phoneNumber = normalizePhoneNumber(toNumber);
            if (phoneNumber == null) {
                System.err.println("SMS send failed: invalid phone number");
                return false;
            }

            if (verifiedPhoneNumber != null && !verifiedPhoneNumber.isBlank()) {
                System.out.println("CircuitDigest verified number (config): " + verifiedPhoneNumber);
            }

            String var1 = "Dhairya";
            String var2 = message == null ? "" : message;

            String json = "{"
                    + "\"phone_number\":\"" + escapeJson(phoneNumber) + "\","
                    + "\"cd_sms_id\":" + TEMPLATE_ID + ","
                    + "\"variables\":{"
                    + "\"var1\":\"" + escapeJson(var1) + "\","
                    + "\"var2\":\"" + escapeJson(var2) + "\""
                    + "}"
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(SMS_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body() == null ? "" : response.body();

            System.out.println("CircuitDigest response: " + response.statusCode() + " " + body);

            return response.statusCode() == 200 && body.replaceAll("\\s", "").contains("\"success\":true");
        } catch (Exception e) {
            System.err.println("SMS send failed: " + e.getMessage());
            return false;
        }
    }

    private String normalizePhoneNumber(String toNumber) {
        if (toNumber == null) {
            return null;
        }
        String digits = toNumber.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return null;
        }
        if (digits.length() == 10) {
            digits = "91" + digits;
        }
        return "+" + digits;
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
