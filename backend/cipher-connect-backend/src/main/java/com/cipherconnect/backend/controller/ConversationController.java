package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.dto.ConversationResponse;
import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.service.ConversationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(
            ConversationService conversationService) {

        this.conversationService = conversationService;
    }

    @PostMapping("/direct")
    public ResponseEntity<?> createDirectConversation(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String receiverCipherId) {

        try {
            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Conversation conversation =
                    conversationService.createDirectConversation(
                            currentUserId,
                            receiverCipherId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            ConversationResponse.fromConversation(
                                    conversation
                            )
                    );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(
                            exception.getMessage()
                    ));
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}