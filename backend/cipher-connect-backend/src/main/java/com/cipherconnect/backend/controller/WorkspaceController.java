package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.entity.Workspace;
import com.cipherconnect.backend.service.WorkspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(
            WorkspaceService workspaceService) {

        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String name,
            @RequestParam(required = false) String description) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            Workspace workspace =
                    workspaceService.createWorkspace(
                            currentUserId,
                            name,
                            description
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            WorkspaceResponse
                                    .fromWorkspace(workspace)
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

    @GetMapping
    public ResponseEntity<?> getMyWorkspaces(
            @AuthenticationPrincipal Jwt jwt) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            List<Workspace> workspaces =
                    workspaceService.getMyWorkspaces(
                            currentUserId
                    );

            return ResponseEntity.ok(
                    workspaces.stream()
                            .map(
                                    WorkspaceResponse::fromWorkspace
                            )
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

    public record WorkspaceResponse(
            Long id,
            String name,
            String description,
            Long ownerId,
            String ownerCipherId,
            String ownerUsername,
            java.time.LocalDateTime createdAt
    ) {

        public static WorkspaceResponse fromWorkspace(
                Workspace workspace) {

            return new WorkspaceResponse(
                    workspace.getId(),
                    workspace.getName(),
                    workspace.getDescription(),
                    workspace.getOwner().getId(),
                    workspace.getOwner().getCipherId(),
                    workspace.getOwner().getUsername(),
                    workspace.getCreatedAt()
            );
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}