package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.Channel;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.entity.Workspace;
import com.cipherconnect.backend.repository.ChannelRepository;
import com.cipherconnect.backend.repository.UserRepository;
import com.cipherconnect.backend.repository.WorkspaceMemberRepository;
import com.cipherconnect.backend.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public ChannelService(
            ChannelRepository channelRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository) {

        this.channelRepository = channelRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository =
                workspaceMemberRepository;
        this.userRepository = userRepository;
    }

    public Channel createChannel(
            Long currentUserId,
            Long workspaceId,
            String name,
            String description) {

        User currentUser = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        Workspace workspace = workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Workspace not found."
                        )
                );

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
                    "You do not have access to this workspace."
            );
        }

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Channel name cannot be empty."
            );
        }

        Channel channel = new Channel();

        channel.setName(name.trim());

        if (description != null) {
            channel.setDescription(
                    description.trim()
            );
        }

        channel.setWorkspace(workspace);
        channel.setCreatedAt(
                LocalDateTime.now()
        );

        return channelRepository.save(channel);
    }

    public List<Channel> getChannels(
            Long currentUserId,
            Long workspaceId) {

        User currentUser = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        Workspace workspace = workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Workspace not found."
                        )
                );

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
                    "You do not have access to this workspace."
            );
        }

        return channelRepository
                .findByWorkspace(workspace);
    }
}