package com.cipherconnect.backend.dto;

import com.cipherconnect.backend.entity.User;

public record UserResponse(
        Long id,
        String cipherId,
        String username,
        String email,
        String status,
        String createdAt
) {

    public static UserResponse fromUser(User user) {

        return new UserResponse(
                user.getId(),
                user.getCipherId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus(),
                user.getCreatedAt().toString()
        );
    }
}