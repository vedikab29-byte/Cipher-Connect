package com.cipherconnect.backend.service;

import com.cipherconnect.backend.dto.LoginRequest;
import com.cipherconnect.backend.dto.RegisterRequest;
import com.cipherconnect.backend.dto.UserSearchResponse;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(hashedPassword);

        user.setCipherId(generateCipherId(request.getUsername()));
        user.setStatus("OFFLINE");
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    public UserSearchResponse searchByCipherId(String cipherId) {

        User user = userRepository.findByCipherId(cipherId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return UserSearchResponse.fromUser(user);
    }

    public UserSearchResponse searchByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return UserSearchResponse.fromUser(user);
    }

    private String generateCipherId(String username) {

        String usernamePart = username
                .replaceAll("[^a-zA-Z0-9]", "")
                .toUpperCase();

        if (usernamePart.length() > 10) {
            usernamePart = usernamePart.substring(0, 10);
        }

        String randomPart = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 4)
                .toUpperCase();

        String cipherId = "@" + usernamePart + "-" + randomPart;

        if (userRepository.existsByCipherId(cipherId)) {
            return generateCipherId(username);
        }

        return cipherId;
    }
}