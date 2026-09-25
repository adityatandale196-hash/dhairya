package com.dhairya.backend.controller;

import com.dhairya.backend.model.Contact;
import com.dhairya.backend.model.ContactRequest;
import com.dhairya.backend.repository.ContactRepository;
import com.dhairya.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
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

    public ContactController(ContactRepository contactRepository,
                             UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    // VIEW all contacts of the logged-in user
    @GetMapping
    public List<Contact> list(HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return contactRepository.findByUserIdOrderByNameAsc(userId);
    }

    // ADD a contact
    @PostMapping
    public ResponseEntity<Object> add(@RequestBody ContactRequest req, HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        String problem = validate(req);
        if (problem != null) {
            return error(HttpStatus.BAD_REQUEST, problem);
        }
        if (userId == null || !userRepository.existsById(userId)) {
            return error(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Contact contact = new Contact();
        contact.setUserId(userId);
        contact.setName(req.name().trim());
        contact.setPhone(req.phone().trim());
        contact.setEmail(req.email() == null ? null : req.email().trim());
        contact.setRelationship(req.relationship());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactRepository.save(contact));
    }

    // UPDATE a contact
    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable("id") Integer id,
                                         @RequestBody ContactRequest req,
                                         HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        String problem = validate(req);
        if (problem != null) {
            return error(HttpStatus.BAD_REQUEST, problem);
        }

        Optional<Contact> found = contactRepository.findByContactIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Contact not found");
        }

        Contact contact = found.get();
        contact.setName(req.name().trim());
        contact.setPhone(req.phone().trim());
        contact.setEmail(req.email() == null ? null : req.email().trim());
        contact.setRelationship(req.relationship());

        return ResponseEntity.ok(contactRepository.save(contact));
    }

    // DELETE a contact
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable("id") Integer id,
                                         HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");

        Optional<Contact> found = contactRepository.findByContactIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return error(HttpStatus.NOT_FOUND, "Contact not found");
        }
        contactRepository.delete(found.get());
        return ResponseEntity.ok(Map.of("success", true));
    }

    private String validate(ContactRequest req) {
        if (req.name() == null || req.name().isBlank()) return "Name is required";
        if (req.phone() == null || req.phone().isBlank()) return "Phone is required";
        String digits = req.phone().replaceAll("\\D", "");
        if (digits.length() < 10) return "Phone must be at least 10 digits";
        if (req.email() != null && !req.email().isBlank() && !req.email().contains("@")) {
            return "Email looks invalid";
        }
        return null;
    }

    private ResponseEntity<Object> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("success", false, "message", message));
    }
}