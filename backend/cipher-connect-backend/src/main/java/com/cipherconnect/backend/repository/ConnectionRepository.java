package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.Connection;
import com.cipherconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository
        extends JpaRepository<Connection, Long> {

    Optional<Connection> findByRequesterAndReceiver(
            User requester,
            User receiver
    );

    Optional<Connection> findByRequesterAndReceiverOrRequesterAndReceiver(
            User requester1,
            User receiver1,
            User requester2,
            User receiver2
    );

    List<Connection> findByRequesterAndStatus(
            User requester,
            String status
    );

    List<Connection> findByReceiverAndStatus(
            User receiver,
            String status
    );

    List<Connection> findByRequesterOrReceiverAndStatus(
            User requester,
            User receiver,
            String status
    );
}