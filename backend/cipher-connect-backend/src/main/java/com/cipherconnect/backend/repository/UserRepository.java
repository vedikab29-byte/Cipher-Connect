package com.cipherconnect.backend.repository;

import com.cipherconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByCipherId(String cipherId);

    boolean existsByEmail(String email);

    boolean existsByCipherId(String cipherId);

    boolean existsByUsername(String username);
}