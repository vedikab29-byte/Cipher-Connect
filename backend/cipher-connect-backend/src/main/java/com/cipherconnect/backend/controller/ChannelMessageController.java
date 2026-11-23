package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.entity.ChannelMessage;
import com.cipherconnect.backend.service.ChannelMessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/channels")
public class ChannelMessageController {

    private final ChannelMessageService channelMessageService;

    public ChannelMessageController(
            ChannelMessageService channelMessageService) {

        this.channelMessageService =
                channelMessageService;
    }

    @PostMapping("/{channelId}/messages")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long channelId,
            @RequestParam String content) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            ChannelMessage message =
                    channelMessageService.sendMessage(
                            currentUserId,
                            channelId,
                            content
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            ChannelMessageResponse
                                    .fromMessage(message)
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

    @GetMapping("/{channelId}/messages")
    public ResponseEntity<?> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long channelId) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            List<ChannelMessage> messages =
                    channelMessageService.getMessages(
                            currentUserId,
                            channelId
                    );

            return ResponseEntity.ok(
                    messages.stream()
                            .map(
                                    ChannelMessageResponse
                                            ::fromMessage
                            )
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

    public record ChannelMessageResponse(
            Long id,
            Long channelId,
            UserSummary sender,
            String content,
            LocalDateTime createdAt
    ) {

        public static ChannelMessageResponse fromMessage(
                ChannelMessage message) {

            return new ChannelMessageResponse(
                    message.getId(),
                    message.getChannel().getId(),
                    UserSummary.fromUser(
                            message.getSender()
                    ),
                    message.getContent(),
                    message.getCreatedAt()
            );
        }
    }

    public record UserSummary(
            Long id,
            String cipherId,
            String username
    ) {

        public static UserSummary fromUser(
                com.cipherconnect.backend.entity.User user) {

            return new UserSummary(
                    user.getId(),
                    user.getCipherId(),
                    user.getUsername()
            );
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}