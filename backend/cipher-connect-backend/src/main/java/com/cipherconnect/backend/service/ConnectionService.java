package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.Connection;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.repository.ConnectionRepository;
import com.cipherconnect.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public ConnectionService(
            ConnectionRepository connectionRepository,
            UserRepository userRepository) {

        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
    }

    public Connection sendConnectionRequest(
            Long requesterId,
            String receiverCipherId) {

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Requester not found."
                        )
                );

        User receiver = userRepository.findByCipherId(receiverCipherId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Receiver not found."
                        )
                );

        if (requester.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "You cannot send a connection request to yourself."
            );
        }

        Connection existingConnection =
                connectionRepository
                        .findByRequesterAndReceiverOrRequesterAndReceiver(
                                requester,
                                receiver,
                                receiver,
                                requester
                        )
                        .orElse(null);

        if (existingConnection != null) {

            if ("ACCEPTED".equals(existingConnection.getStatus())) {
                throw new IllegalArgumentException(
                        "You are already connected with this user."
                );
            }

            if ("PENDING".equals(existingConnection.getStatus())) {
                throw new IllegalArgumentException(
                        "A connection request already exists."
                );
            }

            if ("REJECTED".equals(existingConnection.getStatus())) {

                existingConnection.setRequester(requester);
                existingConnection.setReceiver(receiver);
                existingConnection.setStatus("PENDING");
                existingConnection.setUpdatedAt(LocalDateTime.now());

                return connectionRepository.save(existingConnection);
            }
        }

        Connection connection = new Connection();

        connection.setRequester(requester);
        connection.setReceiver(receiver);
        connection.setStatus("PENDING");

        LocalDateTime now = LocalDateTime.now();

        connection.setCreatedAt(now);
        connection.setUpdatedAt(now);

        return connectionRepository.save(connection);
    }

    public Connection acceptConnectionRequest(
            Long receiverId,
            Long connectionId) {

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Receiver not found."
                        )
                );

        Connection connection = connectionRepository
                .findById(connectionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Connection request not found."
                        )
                );

        if (!connection.getReceiver().getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "You are not allowed to accept this request."
            );
        }

        if (!"PENDING".equals(connection.getStatus())) {
            throw new IllegalArgumentException(
                    "This connection request is not pending."
            );
        }

        connection.setStatus("ACCEPTED");
        connection.setUpdatedAt(LocalDateTime.now());

        return connectionRepository.save(connection);
    }

    public Connection rejectConnectionRequest(
            Long receiverId,
            Long connectionId) {

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Receiver not found."
                        )
                );

        Connection connection = connectionRepository
                .findById(connectionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Connection request not found."
                        )
                );

        if (!connection.getReceiver().getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "You are not allowed to reject this request."
            );
        }

        if (!"PENDING".equals(connection.getStatus())) {
            throw new IllegalArgumentException(
                    "This connection request is not pending."
            );
        }

        connection.setStatus("REJECTED");
        connection.setUpdatedAt(LocalDateTime.now());

        return connectionRepository.save(connection);
    }

    public List<Connection> getSentPendingRequests(
            Long requesterId) {

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );

        return connectionRepository.findByRequesterAndStatus(
                requester,
                "PENDING"
        );
    }

    public List<Connection> getReceivedPendingRequests(
            Long receiverId) {

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );

        return connectionRepository.findByReceiverAndStatus(
                receiver,
                "PENDING"
        );
    }

    public List<Connection> getAcceptedConnections(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );

        return connectionRepository
                .findByRequesterOrReceiverAndStatus(
                        user,
                        user,
                        "ACCEPTED"
                );
    }
}