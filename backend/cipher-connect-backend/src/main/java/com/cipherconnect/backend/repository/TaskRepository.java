package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.Task;
import com.cipherconnect.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository
        extends JpaRepository<Task, Long> {

    List<Task> findByWorkspaceOrderByCreatedAtDesc(
            Workspace workspace
    );
}