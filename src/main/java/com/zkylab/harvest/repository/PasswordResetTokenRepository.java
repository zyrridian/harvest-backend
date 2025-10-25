package com.zkylab.harvest.repository;

import com.zkylab.harvest.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByResetToken(String resetToken);
    
    Optional<PasswordResetToken> findByResetTokenAndOtpCode(String resetToken, String otpCode);
    
    void deleteByUserId(Long userId);
}
