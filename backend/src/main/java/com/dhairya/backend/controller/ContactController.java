package com.dhairya.backend.controller;

import com.dhairya.backend.model.Contact;
import com.dhairya.backend.model.ContactRequest;
import com.dhairya.backend.repository.ContactRepository;
import com.dhairya.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public ContactController(ContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    // VIEW all contacts of one user
    @GetMapping
    public List<Contact> list(@RequestParam("userId") Integer userId) {
        return contactRepository.findByUserIdOrderByNameAsc(userId);
    }

    // ADD a contact
    @PostMapping
    public ResponseEntity<Object> add(@RequestBody ContactRequest req) {
        String problem = validate(req);
        if (problem != null) {
            return error(HttpStatus.BAD_REQUEST, problem);
        }
        if (!userRepository.existsById(req.userId())) {
            return error(HttpStatus.NOT_FOUND, "User not found");
        }

        Contact contact = new Contact();
        contact.setUserId(req.userId());
        contact.setName(req.name().trim());
        contact.setPhone(req.phone().trim());
        contact.setRelationship(req.relationship());

        return ResponseEntity.status(HttpStatus.CREATED).body(contactRepository.save(contact));
    }

    // EDIT a contact
    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable("id") Integer id,
                                         @RequestBody ContactRequest req) {
        String problem = validate(req);
        if (problem != null) {
            return error(HttpStatus.BAD_REQUEST, problem);
        }

        Optional<Contact> found = contactRepository.findByContactIdAndUserId(id, req.userId());
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Contact not found");
        }

        Contact contact = found.get();
        contact.setName(req.name().trim());
        contact.setPhone(req.phone().trim());
        contact.setRelationship(req.relationship());

        return ResponseEntity.ok(contactRepository.save(contact));
    }

    // DELETE a contact
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable("id") Integer id,
                                         @RequestParam("userId") Integer userId) {
        Optional<Contact> found = contactRepository.findByContactIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Contact not found");
        }

        contactRepository.delete(found.get());
        return ResponseEntity.ok(Map.of("success", true, "message", "Contact deleted"));
    }

    private String validate(ContactRequest req) {
        if (req.userId() == null) {
            return "User id is required";
        }
        if (req.name() == null || req.name().isBlank()) {
            return "Name is required";
        }
        if (req.name().trim().length() > 100) {
            return "Name is too long";
        }
        if (req.phone() == null || req.phone().isBlank()) {
            return "Phone number is required";
        }
        if (req.phone().trim().length() > 15) {
            return "Phone number can be at most 15 characters";
        }
        return null;
    }

    private ResponseEntity<Object> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("success", false, "message", message));
    }
}