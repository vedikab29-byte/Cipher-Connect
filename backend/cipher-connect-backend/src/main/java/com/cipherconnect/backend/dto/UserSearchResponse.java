package com.cipherconnect.backend.dto;

import com.cipherconnect.backend.entity.User;

public record UserSearchResponse(
        String cipherId,
        String username,
        String status
) {

    public static UserSearchResponse fromUser(User user) {

        return new UserSearchResponse(
                user.getCipherId(),
                user.getUsername(),
                user.getStatus()
        );
    }
}