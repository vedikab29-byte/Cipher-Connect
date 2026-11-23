package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.entity.Workspace;
import com.cipherconnect.backend.repository.UserRepository;
import com.cipherconnect.backend.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository) {

        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    public Workspace createWorkspace(
            Long currentUserId,
            String name,
            String description) {

        User currentUser = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Workspace name cannot be empty."
            );
        }

        Workspace workspace = new Workspace();

        workspace.setName(name.trim());

        if (description != null) {
            workspace.setDescription(
                    description.trim()
            );
        }

        workspace.setOwner(currentUser);
        workspace.setCreatedAt(
                LocalDateTime.now()
        );

        return workspaceRepository.save(workspace);
    }

    public List<Workspace> getMyWorkspaces(
            Long currentUserId) {

        User currentUser = userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Current user not found."
                        )
                );

        return workspaceRepository
                .findByOwner(currentUser);
    }
}