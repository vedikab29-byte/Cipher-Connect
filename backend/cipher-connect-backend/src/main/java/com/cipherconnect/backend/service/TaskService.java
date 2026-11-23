package com.cipherconnect.backend.service;

import com.cipherconnect.backend.entity.Task;
import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.entity.Workspace;
import com.cipherconnect.backend.repository.TaskRepository;
import com.cipherconnect.backend.repository.UserRepository;
import com.cipherconnect.backend.repository.WorkspaceMemberRepository;
import com.cipherconnect.backend.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository) {

        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository =
                workspaceMemberRepository;
        this.userRepository = userRepository;
    }

    public Task createTask(
            Long currentUserId,
            Long workspaceId,
            String title,
            String description,
            String priority) {

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

        checkWorkspaceAccess(
                currentUserId,
                workspace,
                currentUser
        );

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Task title cannot be empty."
            );
        }

        String taskPriority =
                priority == null || priority.trim().isEmpty()
                        ? "MEDIUM"
                        : priority.trim().toUpperCase();

        if (!taskPriority.equals("LOW")
                && !taskPriority.equals("MEDIUM")
                && !taskPriority.equals("HIGH")) {

            throw new IllegalArgumentException(
                    "Priority must be LOW, MEDIUM, or HIGH."
            );
        }

        Task task = new Task();

        task.setTitle(title.trim());

        if (description != null) {
            task.setDescription(
                    description.trim()
            );
        }

        task.setStatus("TODO");
        task.setPriority(taskPriority);
        task.setWorkspace(workspace);
        task.setCreatedBy(currentUser);
        task.setCreatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    public List<Task> getTasks(
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

        checkWorkspaceAccess(
                currentUserId,
                workspace,
                currentUser
        );

        return taskRepository
                .findByWorkspaceOrderByCreatedAtDesc(
                        workspace
                );
    }

    public Task updateTaskStatus(
            Long currentUserId,
            Long workspaceId,
            Long taskId,
            String status) {

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

        checkWorkspaceAccess(
                currentUserId,
                workspace,
                currentUser
        );

        Task task = taskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Task not found."
                        )
                );

        if (!task.getWorkspace()
                .getId()
                .equals(workspaceId)) {

            throw new IllegalArgumentException(
                    "Task does not belong to this workspace."
            );
        }

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Task status cannot be empty."
            );
        }

        String taskStatus =
                status.trim().toUpperCase();

        if (!taskStatus.equals("TODO")
                && !taskStatus.equals("IN_PROGRESS")
                && !taskStatus.equals("COMPLETED")) {

            throw new IllegalArgumentException(
                    "Status must be TODO, IN_PROGRESS, or COMPLETED."
            );
        }

        task.setStatus(taskStatus);

        return taskRepository.save(task);
    }

    public Task assignTask(
            Long currentUserId,
            Long workspaceId,
            Long taskId,
            String memberCipherId) {

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

        checkWorkspaceAccess(
                currentUserId,
                workspace,
                currentUser
        );

        Task task = taskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Task not found."
                        )
                );

        if (!task.getWorkspace()
                .getId()
                .equals(workspaceId)) {

            throw new IllegalArgumentException(
                    "Task does not belong to this workspace."
            );
        }

        if (memberCipherId == null
                || memberCipherId.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Member Cipher ID cannot be empty."
            );
        }

        User member = userRepository
                .findByCipherId(
                        memberCipherId.trim()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User with this Cipher ID was not found."
                        )
                );

        boolean isOwner =
                workspace.getOwner()
                        .getId()
                        .equals(member.getId());

        boolean isMember =
                workspaceMemberRepository
                        .findByWorkspaceAndUser(
                                workspace,
                                member
                        )
                        .isPresent();

        if (!isOwner && !isMember) {
            throw new IllegalArgumentException(
                    "User is not a member of this workspace."
            );
        }

        task.setAssignedTo(member);

        return taskRepository.save(task);
    }

    private void checkWorkspaceAccess(
            Long currentUserId,
            Workspace workspace,
            User currentUser) {

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
    }
}