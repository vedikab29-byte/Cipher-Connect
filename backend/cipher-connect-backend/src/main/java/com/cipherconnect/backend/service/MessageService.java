package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.entity.Message;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.repository.ConversationRepository;
import com.cipherconnect.backend.repository.MessageRepository;
import com.cipherconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            UserRepository userRepository) {

        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    public Message sendMessage(
            Long currentUserId,
            Long conversationId,
            String content) {

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Conversation not found."
                        )
                );

        boolean isParticipant =
                conversation.getUserOne().getId().equals(currentUserId)
                        ||
                conversation.getUserTwo().getId().equals(currentUserId);

        if (!isParticipant) {
            throw new IllegalArgumentException(
                    "You are not a participant in this conversation."
            );
        }

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Message content cannot be empty."
            );
        }

        Message message = new Message();

        message.setConversation(conversation);
        message.setSender(currentUser);
        message.setContent(content.trim());
        message.setCreatedAt(LocalDateTime.now());

        conversation.setUpdatedAt(LocalDateTime.now());

        conversationRepository.save(conversation);

        return messageRepository.save(message);
    }

    public List<Message> getMessages(
            Long currentUserId,
            Long conversationId) {

        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Conversation not found."
                        )
                );

        boolean isParticipant =
                conversation.getUserOne().getId().equals(currentUserId)
                        ||
                conversation.getUserTwo().getId().equals(currentUserId);

        if (!isParticipant) {
            throw new IllegalArgumentException(
                    "You are not a participant in this conversation."
            );
        }

        return messageRepository
                .findByConversationOrderByCreatedAtAsc(
                        conversation
                );
    }
}