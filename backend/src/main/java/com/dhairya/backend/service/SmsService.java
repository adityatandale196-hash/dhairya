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

    @Value("${circuitdigest.phone.number}")
    private String verifiedNumber;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendSms(String toNumber, String message) {
        try {
            // CircuitDigest sends to your verified number for the free tier
            String url = "https://www.circuitdigest.cloud/api/v1/send_sms"
                    + "?api_key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
                    + "&number=" + URLEncoder.encode(verifiedNumber, StandardCharsets.UTF_8)
                    + "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            System.out.println("CircuitDigest response: " + res.statusCode() + " -> " + res.body());
            return res.statusCode() == 200;

        } catch (Exception e) {
            System.err.println("SMS send failed: " + e.getMessage());
            return false;
        }
    }
}