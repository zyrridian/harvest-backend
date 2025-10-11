package com.zkylab.harvest.repository;

import com.zkylab.harvest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA automatically creates the implementation for this method
    // based on its name. It will generate a query like:
    // SELECT * FROM app_users WHERE username = ?
    Optional<User> findByUsername(String username);

    // New methods for registration validation
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
