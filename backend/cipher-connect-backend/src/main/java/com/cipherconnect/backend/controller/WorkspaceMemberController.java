package com.cipherconnect.backend.controller;

import com.cipherconnect.backend.entity.WorkspaceMember;
import com.cipherconnect.backend.service.WorkspaceMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceMemberController {

    private final WorkspaceMemberService workspaceMemberService;

    public WorkspaceMemberController(
            WorkspaceMemberService workspaceMemberService) {

        this.workspaceMemberService =
                workspaceMemberService;
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<?> addMember(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId,
            @RequestParam String memberCipherId) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            WorkspaceMember member =
                    workspaceMemberService.addMember(
                            currentUserId,
                            workspaceId,
                            memberCipherId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            WorkspaceMemberResponse
                                    .fromMember(member)
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

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<?> getMembers(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long workspaceId) {

        try {

            Long currentUserId =
                    Long.valueOf(jwt.getSubject());

            List<WorkspaceMember> members =
                    workspaceMemberService.getMembers(
                            currentUserId,
                            workspaceId
                    );

            return ResponseEntity.ok(
                    members.stream()
                            .map(
                                    WorkspaceMemberResponse
                                            ::fromMember
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

    public record WorkspaceMemberResponse(
            Long id,
            Long workspaceId,
            Long userId,
            String cipherId,
            String username,
            String role,
            LocalDateTime joinedAt
    ) {

        public static WorkspaceMemberResponse fromMember(
                WorkspaceMember member) {

            return new WorkspaceMemberResponse(
                    member.getId(),
                    member.getWorkspace().getId(),
                    member.getUser().getId(),
                    member.getUser().getCipherId(),
                    member.getUser().getUsername(),
                    member.getRole(),
                    member.getJoinedAt()
            );
        }
    }

    public record ErrorResponse(
            String message
    ) {
    }
}