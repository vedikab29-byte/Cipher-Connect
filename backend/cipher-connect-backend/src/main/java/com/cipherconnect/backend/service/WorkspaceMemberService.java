package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.entity.Workspace;
import com.cipherconnect.backend.entity.WorkspaceMember;
import com.cipherconnect.backend.repository.ConnectionRepository;
import com.cipherconnect.backend.repository.UserRepository;
import com.cipherconnect.backend.repository.WorkspaceMemberRepository;
import com.cipherconnect.backend.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkspaceMemberService {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    public WorkspaceMemberService(
            WorkspaceMemberRepository workspaceMemberRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            ConnectionRepository connectionRepository) {

        this.workspaceMemberRepository = workspaceMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    public WorkspaceMember addMember(
            Long currentUserId,
            Long workspaceId,
            String memberCipherId) {

        User owner = userRepository
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

        if (!workspace.getOwner().getId().equals(currentUserId)) {
            throw new IllegalArgumentException(
                    "Only the workspace owner can add members."
            );
        }

        if (memberCipherId == null ||
                memberCipherId.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Member Cipher ID cannot be empty."
            );
        }

        User member = userRepository
                .findByCipherId(memberCipherId.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User with this Cipher ID was not found."
                        )
                );

        if (member.getId().equals(owner.getId())) {
            throw new IllegalArgumentException(
                    "Workspace owner is already a member."
            );
        }

        boolean connected =
                connectionRepository
                        .findByRequesterAndReceiverOrRequesterAndReceiver(
                                owner,
                                member,
                                member,
                                owner
                        )
                        .map(connection ->
                                "ACCEPTED".equals(
                                        connection.getStatus()
                                )
                        )
                        .orElse(false);

        if (!connected) {
            throw new IllegalArgumentException(
                    "You can only add an accepted connection."
            );
        }

        if (workspaceMemberRepository
                .findByWorkspaceAndUser(workspace, member)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "User is already a member of this workspace."
            );
        }

        WorkspaceMember workspaceMember =
                new WorkspaceMember();

        workspaceMember.setWorkspace(workspace);
        workspaceMember.setUser(member);
        workspaceMember.setRole("MEMBER");
        workspaceMember.setJoinedAt(
                LocalDateTime.now()
        );

        return workspaceMemberRepository
                .save(workspaceMember);
    }

    public List<WorkspaceMember> getMembers(
            Long currentUserId,
            Long workspaceId) {

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
                userRepository.findById(currentUserId)
                        .map(user ->
                                workspaceMemberRepository
                                        .findByWorkspaceAndUser(
                                                workspace,
                                                user
                                        )
                                        .isPresent()
                        )
                        .orElse(false);

        if (!isOwner && !isMember) {
            throw new IllegalArgumentException(
                    "You do not have access to this workspace."
            );
        }

        return workspaceMemberRepository
                .findByWorkspace(workspace);
    }
}