
package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.dto.MessageResponse;
import com.cipherconnect.backend.entity.Message;
import com.cipherconnect.backend.service.MessageService;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketMessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMessageController(
            MessageService messageService,
            SimpMessagingTemplate messagingTemplate) {

        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/conversations/{conversationId}/messages")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            @Payload MessageRequest request,
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new IllegalArgumentException(
                    "Authentication is required."
            );
        }

        Long currentUserId =
                Long.valueOf(authentication.getName());

        // Save the message using the existing service.
        Message savedMessage = messageService.sendMessage(
                currentUserId,
                conversationId,
                request.content()
        );

        // Convert the saved message into the existing response format.
        MessageResponse response =
                MessageResponse.fromMessage(savedMessage);

        // Broadcast the saved message to conversation participants.
        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationId,
                response
        );
    }

    public record MessageRequest(String content) {
    }
}
