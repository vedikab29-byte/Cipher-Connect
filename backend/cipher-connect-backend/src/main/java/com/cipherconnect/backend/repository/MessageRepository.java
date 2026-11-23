package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderByCreatedAtAsc(
            Conversation conversation
    );
}