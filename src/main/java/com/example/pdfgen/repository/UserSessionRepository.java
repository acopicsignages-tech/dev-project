package com.example.pdfgen.repository;

import com.example.pdfgen.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByToken(UUID token);
    void deleteByUserId(Long userId);
}
