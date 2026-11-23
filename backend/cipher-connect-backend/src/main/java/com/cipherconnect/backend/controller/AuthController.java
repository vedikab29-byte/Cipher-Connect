package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.dto.LoginRequest;
import com.cipherconnect.backend.dto.RegisterRequest;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.security.JwtService;
import com.cipherconnect.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        try {
            User user = userService.registerUser(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new RegistrationResponse(
                            user.getCipherId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getStatus()
                    )
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(exception.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        try {
            User user = userService.loginUser(request);

            String accessToken = jwtService.generateToken(user);

            return ResponseEntity.ok(
                    new LoginResponse(
                            accessToken,
                            user.getCipherId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getStatus()
                    )
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse(exception.getMessage())
            );
        }
    }

    public record RegistrationResponse(
            String cipherId,
            String username,
            String email,
            String status
    ) {
    }

    public record LoginResponse(
            String accessToken,
            String cipherId,
            String username,
            String email,
            String status
    ) {
    }

    public record ErrorResponse(
            String message
    ) {
    }
}