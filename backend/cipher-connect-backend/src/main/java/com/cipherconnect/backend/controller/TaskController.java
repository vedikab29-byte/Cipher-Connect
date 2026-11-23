package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.entity.Task;
import com.cipherconnect.backend.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/{workspaceId}/tasks")
    public ResponseEntity<?> createTask(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String priority) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Task task =
                    taskService.createTask(
                            currentUserId,
                            workspaceId,
                            title,
                            description,
                            priority
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(TaskResponse.fromTask(task));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    @GetMapping("/{workspaceId}/tasks")
    public ResponseEntity<?> getTasks(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            List<Task> tasks =
                    taskService.getTasks(
                            currentUserId,
                            workspaceId
                    );

            return ResponseEntity.ok(
                    tasks.stream()
                            .map(TaskResponse::fromTask)
                            .toList()
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    @PutMapping("/{workspaceId}/tasks/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            @RequestParam String status) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Task task =
                    taskService.updateTaskStatus(
                            currentUserId,
                            workspaceId,
                            taskId,
                            status
                    );

            return ResponseEntity.ok(
                    TaskResponse.fromTask(task)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    @PutMapping("/{workspaceId}/tasks/{taskId}/assignee")
    public ResponseEntity<?> assignTask(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            @RequestParam String memberCipherId) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Task task =
                    taskService.assignTask(
                            currentUserId,
                            workspaceId,
                            taskId,
                            memberCipherId
                    );

            return ResponseEntity.ok(
                    TaskResponse.fromTask(task)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new ErrorResponse(
                                    exception.getMessage()
                            )
                    );
        }
    }

    public record TaskResponse(
            Long id,
            String title,
            String description,
            String status,
            String priority,
            Long workspaceId,
            Long createdById,
            String createdByCipherId,
            String createdByUsername,
            Long assignedToId,
            String assignedToCipherId,
            String assignedToUsername,
            LocalDateTime createdAt
    ) {

        public static TaskResponse fromTask(Task task) {

            return new TaskResponse(
                    task.getId(),
                    task.getTitle(),
                    task.getDescription(),
                    task.getStatus(),
                    task.getPriority(),
                    task.getWorkspace().getId(),
                    task.getCreatedBy().getId(),
                    task.getCreatedBy().getCipherId(),
                    task.getCreatedBy().getUsername(),
                    task.getAssignedTo() != null
                            ? task.getAssignedTo().getId()
                            : null,
                    task.getAssignedTo() != null
                            ? task.getAssignedTo().getCipherId()
                            : null,
                    task.getAssignedTo() != null
                            ? task.getAssignedTo().getUsername()
                            : null,
                    task.getCreatedAt()
            );
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}