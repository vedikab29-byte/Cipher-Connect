
package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.Connection;
import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.repository.ConnectionRepository;
import com.cipherconnect.backend.repository.ConversationRepository;
import com.cipherconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            UserRepository userRepository,
            ConnectionRepository connectionRepository) {

        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    public synchronized Conversation createDirectConversation(
            Long currentUserId,
            String receiverCipherId) {

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        User receiver = userRepository.findByCipherId(receiverCipherId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Receiver not found."
                        )
                );

        if (currentUser.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "You cannot create a conversation with yourself."
            );
        }

        Connection connection = connectionRepository
                .findByRequesterAndReceiverOrRequesterAndReceiver(
                        currentUser,
                        receiver,
                        receiver,
                        currentUser
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "You must be connected before starting a conversation."
                        )
                );

        if (!"ACCEPTED".equals(connection.getStatus())) {
            throw new IllegalArgumentException(
                    "You must have an accepted connection to start a conversation."
            );
        }

        List<Conversation> forwardConversations =
                conversationRepository
                        .findAllByUserOneAndUserTwoOrderByCreatedAtAsc(
                                currentUser,
                                receiver
                        );

        List<Conversation> reverseConversations =
                conversationRepository
                        .findAllByUserTwoAndUserOneOrderByCreatedAtAsc(
                                currentUser,
                                receiver
                        );

        return Stream.concat(
                        forwardConversations.stream(),
                        reverseConversations.stream()
                )
                .min(
                        Comparator.comparing(
                                Conversation::getCreatedAt,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        ).thenComparing(
                                Conversation::getId,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                )
                .orElseGet(() -> {

                    Conversation conversation = new Conversation();

                    conversation.setType("DIRECT");
                    conversation.setUserOne(currentUser);
                    conversation.setUserTwo(receiver);

                    LocalDateTime now = LocalDateTime.now();

                    conversation.setCreatedAt(now);
                    conversation.setUpdatedAt(now);

                    return conversationRepository.save(conversation);
                });
    }
}
