package com.cipherconnect.backend.dto;

import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.entity.User;

import java.time.LocalDateTime;

public record ConversationResponse(
        Long id,
        String type,
        UserSummary userOne,
        UserSummary userTwo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ConversationResponse fromConversation(
            Conversation conversation) {

        return new ConversationResponse(
                conversation.getId(),
                conversation.getType(),
                UserSummary.fromUser(conversation.getUserOne()),
                UserSummary.fromUser(conversation.getUserTwo()),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
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