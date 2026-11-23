package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.dto.ConnectionResponse;
import com.cipherconnect.backend.entity.Connection;
import com.cipherconnect.backend.service.ConnectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendConnectionRequest(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String receiverCipherId) {

        try {
            Long requesterId = Long.valueOf(jwt.getSubject());

            Connection connection =
                    connectionService.sendConnectionRequest(
                            requesterId,
                            receiverCipherId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ConnectionResponse.fromConnection(connection));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }

    @PutMapping("/{connectionId}/accept")
    public ResponseEntity<?> acceptConnectionRequest(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long connectionId) {

        try {
            Long receiverId = Long.valueOf(jwt.getSubject());

            Connection connection =
                    connectionService.acceptConnectionRequest(
                            receiverId,
                            connectionId
                    );

            return ResponseEntity.ok(
                    ConnectionResponse.fromConnection(connection)
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }

    @PutMapping("/{connectionId}/reject")
    public ResponseEntity<?> rejectConnectionRequest(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long connectionId) {

        try {
            Long receiverId = Long.valueOf(jwt.getSubject());

            Connection connection =
                    connectionService.rejectConnectionRequest(
                            receiverId,
                            connectionId
                    );

            return ResponseEntity.ok(
                    ConnectionResponse.fromConnection(connection)
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<?> getSentRequests(
            @AuthenticationPrincipal Jwt jwt) {

        try {
            Long userId = Long.valueOf(jwt.getSubject());

            List<Connection> connections =
                    connectionService.getSentPendingRequests(userId);

            return ResponseEntity.ok(
                    connections.stream()
                            .map(ConnectionResponse::fromConnection)
                            .toList()
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }

    @GetMapping("/requests/received")
    public ResponseEntity<?> getReceivedRequests(
            @AuthenticationPrincipal Jwt jwt) {

        try {
            Long userId = Long.valueOf(jwt.getSubject());

            List<Connection> connections =
                    connectionService.getReceivedPendingRequests(userId);

            return ResponseEntity.ok(
                    connections.stream()
                            .map(ConnectionResponse::fromConnection)
                            .toList()
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAcceptedConnections(
            @AuthenticationPrincipal Jwt jwt) {

        try {
            Long userId = Long.valueOf(jwt.getSubject());

            List<Connection> connections =
                    connectionService.getAcceptedConnections(userId);

            return ResponseEntity.ok(
                    connections.stream()
                            .map(ConnectionResponse::fromConnection)
                            .toList()
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}