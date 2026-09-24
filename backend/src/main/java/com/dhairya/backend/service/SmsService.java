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

    @Value("${fast2sms.api.key}")
    private String apiKey;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Sends an SMS using Fast2SMS Quick SMS route (no DLT needed).
     * Returns true if the API accepted the message.
     */
    public boolean sendSms(String toNumber, String message) {
        try {
            // Fast2SMS Quick SMS expects a plain 10-digit Indian number
            String clean = toNumber.replaceAll("\\D", "");
            if (clean.length() > 10) {
                clean = clean.substring(clean.length() - 10);
            }

            String json = "{"
                    + "\"route\":\"q\","
                    + "\"message\":\"" + escapeJson(message) + "\","
                    + "\"numbers\":\"" + clean + "\","
                    + "\"flash\":0"
                    + "}";

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.fast2sms.com/dev/bulkV2"))
                    .timeout(Duration.ofSeconds(15))
                    .header("authorization", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            System.out.println("Fast2SMS response: " + res.statusCode() + " -> " + res.body());
            return res.statusCode() == 200 && res.body().contains("\"return\":true");

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