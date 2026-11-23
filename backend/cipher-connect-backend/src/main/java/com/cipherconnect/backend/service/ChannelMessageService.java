package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.Channel;
import com.cipherconnect.backend.entity.ChannelMessage;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.entity.Workspace;
import com.cipherconnect.backend.repository.ChannelMessageRepository;
import com.cipherconnect.backend.repository.ChannelRepository;
import com.cipherconnect.backend.repository.UserRepository;
import com.cipherconnect.backend.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChannelMessageService {

    private final ChannelMessageRepository channelMessageRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ChannelMessageService(
            ChannelMessageRepository channelMessageRepository,
            ChannelRepository channelRepository,
            UserRepository userRepository,
            WorkspaceMemberRepository workspaceMemberRepository) {

        this.channelMessageRepository = channelMessageRepository;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository =
                workspaceMemberRepository;
    }

    public ChannelMessage sendMessage(
            Long currentUserId,
            Long channelId,
            String content) {

        User currentUser = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        Channel channel = channelRepository
                .findById(channelId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Channel not found."
                        )
                );

        Workspace workspace = channel.getWorkspace();

        boolean isOwner =
                workspace.getOwner()
                        .getId()
                        .equals(currentUserId);

        boolean isMember =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                currentUser
                        )
                        .isPresent();

        if (!isOwner && !isMember) {
            throw new IllegalArgumentException(
                    "You do not have access to this channel."
            );
        }

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Message content cannot be empty."
            );
        }

        ChannelMessage message =
                new ChannelMessage();

        message.setChannel(channel);
        message.setSender(currentUser);
        message.setContent(content.trim());
        message.setCreatedAt(
                LocalDateTime.now()
        );

        return channelMessageRepository.save(message);
    }

    public List<ChannelMessage> getMessages(
            Long currentUserId,
            Long channelId) {

        User currentUser = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        Channel channel = channelRepository
                .findById(channelId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Channel not found."
                        )
                );

        Workspace workspace = channel.getWorkspace();

        boolean isOwner =
                workspace.getOwner()
                        .getId()
                        .equals(currentUserId);

        boolean isMember =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                currentUser
                        )
                        .isPresent();

        if (!isOwner && !isMember) {
            throw new IllegalArgumentException(
                    "You do not have access to this channel."
            );
        }

        return channelMessageRepository
                .findByChannelOrderByCreatedAtAsc(
                        channel
                );
    }
}