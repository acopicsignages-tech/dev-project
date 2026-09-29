package com.example.pdfgen.repository;

import com.example.pdfgen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    List<User> findAllByOrderByCreatedAtDesc();
}
