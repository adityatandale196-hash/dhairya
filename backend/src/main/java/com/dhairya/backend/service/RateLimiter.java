package com.dhairya.backend.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiter {

    // userId -> timestamp of last escalation
    private final ConcurrentHashMap<Integer, Long> lastEscalateByUser = new ConcurrentHashMap<>();

    // Minimum interval between escalations, in milliseconds
    private static final long MIN_INTERVAL_MS = 60_000L; // 60 seconds

    /**
     * Returns true if the user is allowed to escalate right now.
     * Returns false if they escalated within the last MIN_INTERVAL_MS.
     */
    public boolean allow(Integer userId) {
        if (userId == null) {
            return false;
        }
        long now = System.currentTimeMillis();
        Long last = lastEscalateByUser.get(userId);

        if (last != null && (now - last) < MIN_INTERVAL_MS) {
            return false;
        }

        lastEscalateByUser.put(userId, now);
        return true;
    }
}