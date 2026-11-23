package com.cipherconnect.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecurityTestController {

    @GetMapping("/api/secure-test")
    public String secureTest() {
        return "You are authenticated";
    }
}