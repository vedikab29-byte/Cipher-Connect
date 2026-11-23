
package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.dto.MessageResponse;
import com.cipherconnect.backend.entity.Message;
import com.cipherconnect.backend.service.MessageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(
            MessageService messageService,
            SimpMessagingTemplate messagingTemplate) {

        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long conversationId,
            @RequestParam String content) {

        try {
            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Message message =
                    messageService.sendMessage(
                            currentUserId,
                            conversationId,
                            content
                    );

            MessageResponse response =
                    MessageResponse.fromMessage(message);

            // Broadcast the saved message to both participants.
            messagingTemplate.convertAndSend(
                    "/topic/conversations/" + conversationId,
                    response
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    @GetMapping
    public ResponseEntity<?> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long conversationId) {

        try {
            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            List<Message> messages =
                    messageService.getMessages(
                            currentUserId,
                            conversationId
                    );

            return ResponseEntity.ok(
                    messages.stream()
                            .map(MessageResponse::fromMessage)
                            .toList()
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    public record ErrorResponse(String message) {
    }
}
