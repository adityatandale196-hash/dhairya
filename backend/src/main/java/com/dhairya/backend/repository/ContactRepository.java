package com.dhairya.backend.repository;

import com.dhairya.backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Integer> {

    List<Contact> findByUserIdOrderByNameAsc(Integer userId);

    Optional<Contact> findByContactIdAndUserId(Integer contactId, Integer userId);

    List<Contact> findByUserId(Integer userId);
}