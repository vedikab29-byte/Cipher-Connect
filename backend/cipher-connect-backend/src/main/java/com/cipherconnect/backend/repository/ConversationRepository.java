
package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.Conversation;
import com.cipherconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    List<Conversation> findAllByUserOneAndUserTwoOrderByCreatedAtAsc(
            User userOne,
            User userTwo
    );

    List<Conversation> findAllByUserTwoAndUserOneOrderByCreatedAtAsc(
            User userTwo,
            User userOne
    );
}
