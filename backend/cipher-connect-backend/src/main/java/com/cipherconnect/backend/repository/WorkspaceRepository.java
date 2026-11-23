package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.User;
import com.cipherconnect.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository
        extends JpaRepository<Workspace, Long> {

    List<Workspace> findByOwner(User owner);

}