package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/search")
public class UserSearchController {

    private final UserService userService;

    public UserSearchController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/cipher-id")
    public ResponseEntity<?> searchByCipherId(
            @RequestParam String cipherId) {

        try {
            return ResponseEntity.ok(
                    userService.searchByCipherId(cipherId)
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/email")
    public ResponseEntity<?> searchByEmail(
            @RequestParam String email) {

        try {
            return ResponseEntity.ok(
                    userService.searchByEmail(email)
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.notFound().build();
        }
    }
}