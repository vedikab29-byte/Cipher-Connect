package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.entity.Channel;
import com.cipherconnect.backend.service.ChannelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class ChannelController {

    private final ChannelService channelService;

    public ChannelController(
            ChannelService channelService) {

        this.channelService = channelService;
    }

    @PostMapping("/{workspaceId}/channels")
    public ResponseEntity<?> createChannel(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId,
            @RequestParam String name,
            @RequestParam(required = false) String description) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Channel channel =
                    channelService.createChannel(
                            currentUserId,
                            workspaceId,
                            name,
                            description
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            ChannelResponse
                                    .fromChannel(channel)
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

    @GetMapping("/{workspaceId}/channels")
    public ResponseEntity<?> getChannels(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            List<Channel> channels =
                    channelService.getChannels(
                            currentUserId,
                            workspaceId
                    );

            return ResponseEntity.ok(
                    channels.stream()
                            .map(
                                    ChannelResponse
                                            ::fromChannel
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

    public record ChannelResponse(
            Long id,
            String name,
            String description,
            Long workspaceId,
            LocalDateTime createdAt
    ) {

        public static ChannelResponse fromChannel(
                Channel channel) {

            return new ChannelResponse(
                    channel.getId(),
                    channel.getName(),
                    channel.getDescription(),
                    channel.getWorkspace().getId(),
                    channel.getCreatedAt()
            );
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}