package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.Channel;
import com.cipherconnect.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelRepository
        extends JpaRepository<Channel, Long> {

    List<Channel> findByWorkspace(Workspace workspace);
}