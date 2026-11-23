
package com.cipherconnect.backend.security;

import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.repository.ConversationRepository;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private final ConversationRepository conversationRepository;

    public WebSocketAuthInterceptor(
            JwtDecoder jwtDecoder,
            ConversationRepository conversationRepository) {

        this.jwtDecoder = jwtDecoder;
        this.conversationRepository = conversationRepository;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        // Authenticate the WebSocket connection using JWT.
        if (command == StompCommand.CONNECT) {

            String authorization =
                    accessor.getFirstNativeHeader("Authorization");

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {

                throw new MessageDeliveryException(
                        message,
                        "Missing WebSocket authentication token."
                );
            }

            try {

                String token = authorization.substring(7).trim();

                Jwt jwt = jwtDecoder.decode(token);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                jwt.getSubject(),
                                null,
                                List.of()
                        );

                accessor.setUser(authentication);

            } catch (JwtException | IllegalArgumentException exception) {

                throw new MessageDeliveryException(
                        message,
                        "Invalid or expired WebSocket token."
                );
            }
        }

        // Authorize subscriptions and message sending.
        if (command == StompCommand.SUBSCRIBE ||
                command == StompCommand.SEND) {

            Principal principal = accessor.getUser();

            if (principal == null) {
                throw new MessageDeliveryException(
                        message,
                        "Authentication required."
                );
            }

            String destination = accessor.getDestination();

            String conversationIdText;

            if (command == StompCommand.SUBSCRIBE) {

                if (destination == null ||
                        !destination.matches(
                                "^/topic/conversations/\\d+$"
                        )) {

                    throw new MessageDeliveryException(
                            message,
                            "Invalid subscription destination."
                    );
                }

                conversationIdText =
                        destination.substring(
                                "/topic/conversations/".length()
                        );

            } else {

                if (destination == null ||
                        !destination.matches(
                                "^/app/conversations/\\d+/messages$"
                        )) {

                    throw new MessageDeliveryException(
                            message,
                            "Invalid message destination."
                    );
                }

                conversationIdText =
                        destination.split("/")[3];
            }

            Long currentUserId;
            Long conversationId;

            try {
                currentUserId = Long.valueOf(principal.getName());
                conversationId = Long.valueOf(conversationIdText);

            } catch (NumberFormatException exception) {

                throw new MessageDeliveryException(
                        message,
                        "Invalid user or conversation ID."
                );
            }

            Conversation conversation =
                    conversationRepository.findById(conversationId)
                            .orElseThrow(() ->
                                    new MessageDeliveryException(
                                            message,
                                            "Conversation not found."
                                    )
                            );

            boolean isParticipant =
                    conversation.getUserOne().getId()
                            .equals(currentUserId)
                    ||
                    conversation.getUserTwo().getId()
                            .equals(currentUserId);

            if (!isParticipant) {

                throw new MessageDeliveryException(
                        message,
                        "You are not authorized for this conversation."
                );
            }
        }

        return message;
    }
}
