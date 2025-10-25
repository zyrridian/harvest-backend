package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.LoginRequest;
import com.zkylab.harvest.dto.LoginResponse;
import com.zkylab.harvest.dto.LoginErrorResponse;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Login Service - Handles user authentication and login logic
 * 
 * This service manages:
 * - User authentication (email/phone + password)
 * - Failed login attempt tracking
 * - Account locking mechanism
 * - JWT token generation
 */
@Service
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Security constants
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 30;

    public LoginService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Authenticate user and generate tokens
     * 
     * @param request Login request with identifier (email/phone) and password
     * @return LoginResponse on success, LoginErrorResponse on failure
     */
    public Object login(LoginRequest request) {
        // Step 1: Find user by email or phone
        Optional<User> userOptional = findUserByIdentifier(request.getIdentifier());

        if (userOptional.isEmpty()) {
            return createInvalidCredentialsError(MAX_LOGIN_ATTEMPTS);
        }

        User user = userOptional.get();

        // Step 2: Check if account is locked
        if (isAccountLocked(user)) {
            return createAccountLockedError(user.getLockedUntil());
        }

        // Step 3: Check if account is suspended
        if ("suspended".equals(user.getAccountStatus())) {
            return createAccountSuspendedError();
        }

        // Step 4: Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return handleFailedLogin(user);
        }

        // Step 5: Check if email is verified (optional requirement)
        // Uncomment if you want to enforce email verification before login
        /*
        if (!user.getIsEmailVerified()) {
            return createEmailNotVerifiedError(user);
        }
        */

        // Step 6: Successful login - reset failed attempts and generate tokens
        resetFailedAttempts(user);
        updateLastLogin(user);

        return createSuccessResponse(user, request.getRemember_me() != null ? request.getRemember_me() : false);
    }

    /**
     * Find user by email or phone number
     */
    private Optional<User> findUserByIdentifier(String identifier) {
        // Check if identifier is an email (contains @)
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier);
        } else {
            // Assume it's a phone number
            // If phone doesn't include country code, you may need to add it here
            return userRepository.findByPhoneNumber(identifier);
        }
    }

    /**
     * Check if account is currently locked
     */
    private boolean isAccountLocked(User user) {
        if (user.getIsAccountLocked() != null && user.getIsAccountLocked()) {
            // Check if lock duration has expired
            if (user.getLockedUntil() != null && ZonedDateTime.now().isBefore(user.getLockedUntil())) {
                return true;
            } else {
                // Lock has expired, unlock the account
                user.setIsAccountLocked(false);
                user.setLockedUntil(null);
                userRepository.save(user);
                return false;
            }
        }
        return false;
    }

    /**
     * Handle failed login attempt
     */
    private LoginErrorResponse handleFailedLogin(User user) {
        int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            // Lock the account
            user.setIsAccountLocked(true);
            user.setLockedUntil(ZonedDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            userRepository.save(user);
            return createAccountLockedError(user.getLockedUntil());
        } else {
            userRepository.save(user);
            return createInvalidCredentialsError(MAX_LOGIN_ATTEMPTS - attempts);
        }
    }

    /**
     * Reset failed login attempts after successful login
     */
    private void resetFailedAttempts(User user) {
        user.setFailedLoginAttempts(0);
        user.setIsAccountLocked(false);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    /**
     * Update last login timestamp
     */
    private void updateLastLogin(User user) {
        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);
    }

    /**
     * Create successful login response with tokens and user info
     */
    private LoginResponse createSuccessResponse(User user, boolean rememberMe) {
        LoginResponse response = new LoginResponse();
        response.setStatus("success");
        response.setMessage("Login successful");

        LoginResponse.Data data = new LoginResponse.Data();
        
        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), rememberMe);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
        
        data.setAccess_token(accessToken);
        data.setRefresh_token(refreshToken);
        data.setToken_type("Bearer");
        data.setExpires_in(jwtService.getExpirationTimeInSeconds(rememberMe));

        // Set user information
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setUser_id("usr_" + user.getId());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhoneNumber());
        userInfo.setFull_name(user.getFullName());
        userInfo.setUser_type(user.getUserType());
        userInfo.setProfile_picture(user.getProfilePicture());
        userInfo.setIs_verified(user.getIsPhoneVerified() != null && user.getIsPhoneVerified());
        userInfo.setIs_profile_complete(isProfileComplete(user));

        // Verification status
        LoginResponse.VerificationStatus verificationStatus = new LoginResponse.VerificationStatus();
        verificationStatus.setEmail_verified(user.getIsEmailVerified() != null && user.getIsEmailVerified());
        verificationStatus.setPhone_verified(user.getIsPhoneVerified() != null && user.getIsPhoneVerified());
        verificationStatus.setBusiness_verified(false); // Implement business verification logic later
        verificationStatus.setBusiness_verified_at(null);
        userInfo.setVerification_status(verificationStatus);

        // User preferences (default values for now)
        LoginResponse.Preferences preferences = new LoginResponse.Preferences();
        preferences.setLanguage("en");
        preferences.setCurrency("IDR");
        preferences.setNotifications_enabled(true);
        preferences.setTheme("light");
        userInfo.setPreferences(preferences);

        // User statistics (placeholder values - implement actual stats later)
        LoginResponse.Stats stats = new LoginResponse.Stats();
        stats.setTotal_orders(0);
        stats.setTotal_spent(0L);
        stats.setTotal_sales(0L);
        stats.setRating(0.0);
        stats.setReviews_count(0);
        userInfo.setStats(stats);

        data.setUser(userInfo);

        // Permissions based on user type
        data.setPermissions(getPermissionsForUserType(user.getUserType()));

        response.setData(data);
        return response;
    }

    /**
     * Check if user profile is complete
     */
    private boolean isProfileComplete(User user) {
        return user.getFullName() != null && 
               user.getEmail() != null && 
               user.getPhoneNumber() != null &&
               user.getProvince() != null &&
               user.getCity() != null;
    }

    /**
     * Get permissions based on user type
     */
    private List<String> getPermissionsForUserType(String userType) {
        if ("producer".equals(userType) || "both".equals(userType)) {
            return Arrays.asList(
                "create_product",
                "manage_orders",
                "view_analytics",
                "chat_with_users"
            );
        } else if ("buyer".equals(userType)) {
            return Arrays.asList(
                "place_order",
                "view_products",
                "chat_with_sellers"
            );
        }
        return Arrays.asList("view_products");
    }

    /**
     * Create invalid credentials error response
     */
    private LoginErrorResponse createInvalidCredentialsError(int attemptsRemaining) {
        LoginErrorResponse error = new LoginErrorResponse();
        error.setStatus("error");
        error.setMessage("Invalid email/phone or password");
        error.setError_code("INVALID_CREDENTIALS");
        error.setAttempts_remaining(attemptsRemaining);
        return error;
    }

    /**
     * Create account locked error response
     */
    private LoginErrorResponse createAccountLockedError(ZonedDateTime lockedUntil) {
        LoginErrorResponse error = new LoginErrorResponse();
        error.setStatus("error");
        error.setMessage("Your account has been temporarily locked due to multiple failed login attempts");
        error.setError_code("ACCOUNT_LOCKED");
        error.setLocked_until(lockedUntil);
        error.setContact_support(true);
        return error;
    }

    /**
     * Create account suspended error response
     */
    private LoginErrorResponse createAccountSuspendedError() {
        LoginErrorResponse error = new LoginErrorResponse();
        error.setStatus("error");
        error.setMessage("Your account has been suspended. Please contact support.");
        error.setError_code("ACCOUNT_SUSPENDED");
        error.setReason("Terms violation");
        error.setSupport_email("support@farmmarket.com");
        return error;
    }

    /**
     * Create email not verified error response
     */
    private LoginErrorResponse createEmailNotVerifiedError(User user) {
        LoginErrorResponse error = new LoginErrorResponse();
        error.setStatus("error");
        error.setMessage("Please verify your email address to continue");
        error.setError_code("EMAIL_NOT_VERIFIED");
        
        LoginErrorResponse.ErrorData errorData = new LoginErrorResponse.ErrorData();
        errorData.setUser_id("usr_" + user.getId());
        errorData.setEmail(user.getEmail());
        errorData.setCan_resend_verification(true);
        error.setData(errorData);
        
        return error;
    }
}
