package com.dhairya.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank() || !to.contains("@")) {
            System.err.println("Email skipped: invalid address");
            return false;
        }

        // --- DIAGNOSTIC: shows first 10 chars of the key + total length ---
        String keyPreview = (apiKey == null)
                ? "NULL"
                : apiKey.substring(0, Math.min(10, apiKey.length())) + "...(" + apiKey.length() + " chars)";
        System.out.println("Brevo key being used: " + keyPreview);

        String senderPreview = (senderEmail == null) ? "NULL" : senderEmail;
        System.out.println("Brevo sender email: " + senderPreview);

        try {
            String json = "{"
                    + "\"sender\":{\"name\":\"" + escapeJson(senderName) + "\",\"email\":\"" + escapeJson(senderEmail) + "\"},"
                    + "\"to\":[{\"email\":\"" + escapeJson(to) + "\"}],"
                    + "\"subject\":\"" + escapeJson(subject) + "\","
                    + "\"textContent\":\"" + escapeJson(body) + "\""
                    + "}";

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(15))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            System.out.println("Brevo response: " + res.statusCode() + " -> " + res.body());

            if (res.statusCode() == 200 || res.statusCode() == 201) {
                System.out.println("Email sent to: " + to);
                return true;
            } else {
                System.err.println("Email send failed: HTTP " + res.statusCode());
                return false;
            }
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
            return false;
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}