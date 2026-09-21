package com.dhairya.backend.repository;

import com.dhairya.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, Integer> {

    List<Alert> findByUserIdOrderByCreatedAtDesc(Integer userId);

    Optional<Alert> findByAlertIdAndUserId(Integer alertId, Integer userId);
}