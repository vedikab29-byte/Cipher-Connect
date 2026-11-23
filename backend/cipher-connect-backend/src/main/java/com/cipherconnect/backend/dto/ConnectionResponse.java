package com.cipherconnect.backend.dto;

import com.cipherconnect.backend.entity.Connection;

public record ConnectionResponse(
        Long id,
        String requesterCipherId,
        String requesterUsername,
        String receiverCipherId,
        String receiverUsername,
        String status,
        String createdAt,
        String updatedAt
) {

    public static ConnectionResponse fromConnection(Connection connection) {

        return new ConnectionResponse(
                connection.getId(),
                connection.getRequester().getCipherId(),
                connection.getRequester().getUsername(),
                connection.getReceiver().getCipherId(),
                connection.getReceiver().getUsername(),
                connection.getStatus(),
                connection.getCreatedAt().toString(),
                connection.getUpdatedAt().toString()
        );
    }
}