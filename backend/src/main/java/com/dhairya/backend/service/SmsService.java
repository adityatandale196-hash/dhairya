package com.dhairya.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class SmsService {

    @Value("${circuitdigest.api.key}")
    private String apiKey;

    // We'll use Template ID 110 for Location Tracking
    private static final String TEMPLATE_ID = "110";

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendSms(String toNumber, String message) {
        try {
            // CircuitDigest requires the number to be prefixed with 91 for India
            String cleanNumber = toNumber.replaceAll("\\D", "");
            if (cleanNumber.length() == 10) {
                cleanNumber = "91" + cleanNumber;
            }

            // Parse the message to fit the template's two variables.
            // We'll use the user's name (from the caller) and the full message.
            // This is a simplified split; you can adapt it.
            String var1 = "Dhairya User"; // You can pass the actual user name if you modify the method signature
            String var2 = message; // For a real app, you might extract just the location link

            // Build the URL with the Template ID as a query parameter
            String url = "https://www.circuitdigest.cloud/api/v1/send_sms?ID=" + TEMPLATE_ID;

            // Build the JSON body as required by the API
            String json = "{"
                    + "\"mobiles\":\"" + cleanNumber + "\","
                    + "\"var1\":\"" + escapeJson(var1) + "\","
                    + "\"var2\":\"" + escapeJson(var2) + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", apiKey) // API key goes in the Authorization header
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("CircuitDigest response: " + response.statusCode() + " -> " + response.body());
            // Success is indicated by a 200 status code and a "status":"success" in the body
            return response.statusCode() == 200 && response.body().contains("\"status\":\"success\"");

        } catch (Exception e) {
            System.err.println("SMS send failed: " + e.getMessage());
            return false;
        }
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}