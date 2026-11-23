package com.cipherconnect.backend.dto;

import com.cipherconnect.backend.entity.Message;
import com.cipherconnect.backend.entity.User;

import java.time.LocalDateTime;

public record MessageResponse(
        Long id,
        Long conversationId,
        UserSummary sender,
        String content,
        LocalDateTime createdAt
) {

    public static MessageResponse fromMessage(
            Message message) {

        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                UserSummary.fromUser(message.getSender()),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    public record UserSummary(
            Long id,
            String cipherId,
            String username
    ) {

        public static UserSummary fromUser(User user) {

            return new UserSummary(
                    user.getId(),
                    user.getCipherId(),
                    user.getUsername()
            );
        }
    }
}