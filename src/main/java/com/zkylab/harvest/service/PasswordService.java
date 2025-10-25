package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.*;
import com.zkylab.harvest.model.PasswordResetToken;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.PasswordResetTokenRepository;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

/**
 * Password Service - Handles password reset and change operations
 * 
 * This service manages:
 * - Forgot password (request reset)
 * - Reset password with OTP
 * - Change password for authenticated users
 */
@Service
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    // OTP expiration time in minutes
    private static final long RESET_TOKEN_EXPIRY_MINUTES = 15;

    public PasswordService(UserRepository userRepository, 
                          PasswordResetTokenRepository resetTokenRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Handle forgot password request
     * Generates OTP and reset token
     */
    @Transactional
    public Object forgotPassword(ForgotPasswordRequest request) {
        // Find user by email or phone
        Optional<User> userOptional = findUserByIdentifier(request.getIdentifier());

        if (userOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("No account found with this email/phone");
            error.setError_code("USER_NOT_FOUND");
            return error;
        }

        User user = userOptional.get();

        // Delete any existing reset tokens for this user
        resetTokenRepository.deleteByUserId(user.getId());

        // Generate OTP code (6 digits)
        String otpCode = generateOTP();

        // Generate reset token
        String resetToken = "reset_" + UUID.randomUUID().toString().replace("-", "");

        // Create reset token entity
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setResetToken(resetToken);
        token.setOtpCode(otpCode);
        token.setExpiresAt(ZonedDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));
        token.setIsUsed(false);
        token.setCreatedAt(ZonedDateTime.now());

        resetTokenRepository.save(token);

        // TODO: Send OTP via email or SMS
        // For now, we'll just return it in the response (for testing)
        System.out.println("Password Reset OTP for " + user.getEmail() + ": " + otpCode);

        // Build response
        ForgotPasswordResponse response = new ForgotPasswordResponse();
        response.setStatus("success");
        response.setMessage("Password reset code has been sent");

        ForgotPasswordResponse.Data data = new ForgotPasswordResponse.Data();
        data.setReset_token(resetToken);
        data.setSent_to(user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());
        data.setMethod(user.getEmail() != null ? "email" : "sms");
        data.setExpires_at(token.getExpiresAt());

        response.setData(data);
        return response;
    }

    /**
     * Reset password with OTP code
     */
    @Transactional
    public Object resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNew_password().equals(request.getConfirm_password())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Passwords do not match");
            error.setError_code("PASSWORD_MISMATCH");
            return error;
        }

        // Validate password strength
        if (!isValidPassword(request.getNew_password())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
            error.setError_code("WEAK_PASSWORD");
            return error;
        }

        // Find reset token
        Optional<PasswordResetToken> tokenOptional = resetTokenRepository
                .findByResetTokenAndOtpCode(request.getReset_token(), request.getOtp_code());

        if (tokenOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Invalid reset token or OTP code");
            error.setError_code("INVALID_RESET_TOKEN");
            return error;
        }

        PasswordResetToken token = tokenOptional.get();

        // Check if token is expired
        if (ZonedDateTime.now().isAfter(token.getExpiresAt())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Reset token has expired. Please request a new one.");
            error.setError_code("RESET_TOKEN_EXPIRED");
            return error;
        }

        // Check if token is already used
        if (token.getIsUsed() != null && token.getIsUsed()) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Reset token has already been used");
            error.setError_code("RESET_TOKEN_USED");
            return error;
        }

        // Find user
        Optional<User> userOptional = userRepository.findById(token.getUserId());
        if (userOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("User not found");
            error.setError_code("USER_NOT_FOUND");
            return error;
        }

        User user = userOptional.get();

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNew_password()));
        
        // Reset failed login attempts if any
        user.setFailedLoginAttempts(0);
        user.setIsAccountLocked(false);
        user.setLockedUntil(null);
        
        userRepository.save(user);

        // Mark token as used
        token.setIsUsed(true);
        resetTokenRepository.save(token);

        // Build response
        ResetPasswordResponse response = new ResetPasswordResponse();
        response.setStatus("success");
        response.setMessage("Password has been reset successfully");

        ResetPasswordResponse.Data data = new ResetPasswordResponse.Data();
        data.setUser_id("usr_" + user.getId());

        response.setData(data);
        return response;
    }

    /**
     * Change password for authenticated user
     */
    @Transactional
    public Object changePassword(ChangePasswordRequest request, Long userId) {
        // Validate passwords match
        if (!request.getNew_password().equals(request.getConfirm_password())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Passwords do not match");
            error.setError_code("PASSWORD_MISMATCH");
            return error;
        }

        // Validate password strength
        if (!isValidPassword(request.getNew_password())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
            error.setError_code("WEAK_PASSWORD");
            return error;
        }

        // Find user
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("User not found");
            error.setError_code("USER_NOT_FOUND");
            return error;
        }

        User user = userOptional.get();

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrent_password(), user.getPassword())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("Current password is incorrect");
            error.setError_code("INVALID_CURRENT_PASSWORD");
            return error;
        }

        // Check if new password is same as current
        if (passwordEncoder.matches(request.getNew_password(), user.getPassword())) {
            ErrorResponse error = new ErrorResponse();
            error.setStatus("error");
            error.setMessage("New password must be different from current password");
            error.setError_code("SAME_PASSWORD");
            return error;
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNew_password()));
        userRepository.save(user);

        // Build response
        ChangePasswordResponse response = new ChangePasswordResponse();
        response.setStatus("success");
        response.setMessage("Password changed successfully");

        return response;
    }

    /**
     * Find user by email or phone number
     */
    private Optional<User> findUserByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier);
        } else {
            return userRepository.findByPhoneNumber(identifier);
        }
    }

    /**
     * Generate 6-digit OTP
     */
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Validate password strength
     */
    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch));
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
