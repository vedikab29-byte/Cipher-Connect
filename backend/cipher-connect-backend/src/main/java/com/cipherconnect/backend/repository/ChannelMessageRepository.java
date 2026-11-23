package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.Channel;
import com.cipherconnect.backend.entity.ChannelMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelMessageRepository
        extends JpaRepository<ChannelMessage, Long> {

    List<ChannelMessage> findByChannelOrderByCreatedAtAsc(
            Channel channel
    );
}