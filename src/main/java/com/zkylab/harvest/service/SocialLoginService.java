package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.LoginResponse;
import com.zkylab.harvest.dto.SocialLoginRequest;
import com.zkylab.harvest.dto.SocialLoginResponse;
import com.zkylab.harvest.dto.SocialLoginErrorResponse;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Social Login Service - Handles authentication via social providers
 * 
 * This service manages:
 * - Login with Google, Facebook, Apple
 * - Creating new accounts from social login
 * - Linking social accounts
 * 
 * Note: Currently uses mock validation. Replace with actual OAuth validation
 * when integrating with Google, Facebook, or Apple SDKs.
 */
@Service
public class SocialLoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public SocialLoginService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Handle social login - creates account if new, logs in if existing
     * 
     * @param request Social login request with provider and access token
     * @return SocialLoginResponse on success, SocialLoginErrorResponse on failure
     */
    public Object socialLogin(SocialLoginRequest request) {
        // Step 1: Validate social provider token
        // TODO: Replace with actual OAuth validation when integrating third-party SDKs
        SocialUserInfo socialUserInfo = validateSocialToken(request.getProvider(), request.getAccess_token());
        
        if (socialUserInfo == null) {
            return createSocialAuthFailedError("Invalid access token");
        }

        // Step 2: Check if user exists with this social provider
        Optional<User> existingUser = userRepository.findBySocialProviderAndSocialProviderId(
            request.getProvider(), 
            socialUserInfo.socialId
        );

        if (existingUser.isPresent()) {
            // Existing user - just login
            return handleExistingUserLogin(existingUser.get());
        } else {
            // New user - check if email already exists with regular account
            Optional<User> emailUser = userRepository.findByEmail(socialUserInfo.email);
            
            if (emailUser.isPresent()) {
                // Email exists but not linked to this social provider
                // Option: Link the accounts or return error
                // For now, we'll link them
                return linkSocialAccountToExistingUser(emailUser.get(), request.getProvider(), socialUserInfo);
            } else {
                // Completely new user
                return handleNewUserRegistration(request, socialUserInfo);
            }
        }
    }

    /**
     * Validate social provider token and get user info
     * 
     * MOCK IMPLEMENTATION - Replace with actual OAuth validation
     * 
     * In production, you would:
     * - For Google: Use Google Sign-In SDK
     * - For Facebook: Use Facebook Graph API
     * - For Apple: Use Apple Sign In
     */
    private SocialUserInfo validateSocialToken(String provider, String accessToken) {
        // TODO: Replace this mock with actual OAuth validation
        
        // Mock validation - accepts any non-empty token
        if (accessToken == null || accessToken.trim().isEmpty()) {
            return null;
        }

        // Mock social user info
        // In real implementation, fetch this from provider's API
        SocialUserInfo info = new SocialUserInfo();
        info.socialId = "social_" + UUID.randomUUID().toString().substring(0, 16);
        info.email = "user@" + provider + ".com"; // Would come from provider
        info.fullName = "Social User"; // Would come from provider
        info.profilePicture = "https://example.com/avatar.jpg"; // Would come from provider
        
        return info;
    }

    /**
     * Handle login for existing social user
     */
    private SocialLoginResponse handleExistingUserLogin(User user) {
        // Update last login time
        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        SocialLoginResponse response = new SocialLoginResponse();
        response.setStatus("success");
        response.setMessage("Login successful");
        response.setIs_new_user(false);
        response.setRequires_profile_completion(false);

        SocialLoginResponse.Data data = new SocialLoginResponse.Data();
        
        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), false);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
        
        data.setAccess_token(accessToken);
        data.setRefresh_token(refreshToken);
        data.setToken_type("Bearer");
        data.setExpires_in(jwtService.getExpirationTimeInSeconds(false));
        data.setUser(buildUserInfo(user));

        response.setData(data);
        return response;
    }

    /**
     * Link social account to existing email-based account
     */
    private SocialLoginResponse linkSocialAccountToExistingUser(User user, String provider, SocialUserInfo socialInfo) {
        // Link the social account
        user.setSocialProvider(provider);
        user.setSocialProviderId(socialInfo.socialId);
        user.setIsSocialAccount(true);
        user.setIsEmailVerified(true); // Social accounts have verified emails
        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        return handleExistingUserLogin(user);
    }

    /**
     * Handle registration for new social user
     */
    private Object handleNewUserRegistration(SocialLoginRequest request, SocialUserInfo socialInfo) {
        // Validate required fields for new users
        if (request.getUser_type() == null || request.getUser_type().isEmpty()) {
            SocialLoginErrorResponse error = new SocialLoginErrorResponse();
            error.setStatus("error");
            error.setMessage("User type is required for new users");
            error.setError_code("MISSING_USER_TYPE");
            error.setDetails("Please specify user_type: producer, buyer, or both");
            return error;
        }

        // Create new user
        User user = new User();
        user.setUsername(socialInfo.email);
        user.setEmail(socialInfo.email);
        user.setFullName(socialInfo.fullName);
        user.setProfilePicture(socialInfo.profilePicture);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password for social accounts
        user.setUserType(request.getUser_type());
        user.setSocialProvider(request.getProvider());
        user.setSocialProviderId(socialInfo.socialId);
        user.setIsSocialAccount(true);
        user.setIsEmailVerified(true); // Social providers verify emails
        user.setIsPhoneVerified(false);
        user.setAccountStatus("active");
        user.setCreatedAt(ZonedDateTime.now());
        user.setLastLoginAt(ZonedDateTime.now());

        // Add additional info if provided
        if (request.getAdditional_info() != null) {
            if (request.getAdditional_info().getPhone() != null) {
                user.setPhoneNumber(request.getAdditional_info().getPhone());
            }
            
            if (request.getAdditional_info().getLocation() != null) {
                SocialLoginRequest.Location loc = request.getAdditional_info().getLocation();
                user.setProvince(loc.getProvince());
                user.setCity(loc.getCity());
                user.setLatitude(loc.getLatitude());
                user.setLongitude(loc.getLongitude());
            }
        }

        userRepository.save(user);

        // Build response for new user
        SocialLoginResponse response = new SocialLoginResponse();
        response.setStatus("success");
        response.setMessage("Account created successfully");
        response.setIs_new_user(true);
        response.setRequires_profile_completion(isProfileIncomplete(user));

        SocialLoginResponse.Data data = new SocialLoginResponse.Data();
        
        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), false);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
        
        data.setAccess_token(accessToken);
        data.setRefresh_token(refreshToken);
        data.setToken_type("Bearer");
        data.setExpires_in(jwtService.getExpirationTimeInSeconds(false));
        data.setUser(buildUserInfo(user));
        
        if (isProfileIncomplete(user)) {
            data.setNext_step("complete_profile");
        }

        response.setData(data);
        return response;
    }

    /**
     * Check if user profile is incomplete
     */
    private boolean isProfileIncomplete(User user) {
        return user.getPhoneNumber() == null || 
               user.getProvince() == null || 
               user.getCity() == null;
    }

    /**
     * Build user info for response
     */
    private LoginResponse.UserInfo buildUserInfo(User user) {
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setUser_id("usr_" + user.getId());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhoneNumber());
        userInfo.setFull_name(user.getFullName());
        userInfo.setUser_type(user.getUserType());
        userInfo.setProfile_picture(user.getProfilePicture());
        userInfo.setIs_verified(user.getIsEmailVerified() != null && user.getIsEmailVerified());
        userInfo.setIs_profile_complete(!isProfileIncomplete(user));

        // Verification status
        LoginResponse.VerificationStatus verificationStatus = new LoginResponse.VerificationStatus();
        verificationStatus.setEmail_verified(user.getIsEmailVerified() != null && user.getIsEmailVerified());
        verificationStatus.setPhone_verified(user.getIsPhoneVerified() != null && user.getIsPhoneVerified());
        verificationStatus.setBusiness_verified(false);
        verificationStatus.setBusiness_verified_at(null);
        userInfo.setVerification_status(verificationStatus);

        // User preferences
        LoginResponse.Preferences preferences = new LoginResponse.Preferences();
        preferences.setLanguage("en");
        preferences.setCurrency("IDR");
        preferences.setNotifications_enabled(true);
        preferences.setTheme("light");
        userInfo.setPreferences(preferences);

        // User statistics
        LoginResponse.Stats stats = new LoginResponse.Stats();
        stats.setTotal_orders(0);
        stats.setTotal_spent(0L);
        stats.setTotal_sales(0L);
        stats.setRating(0.0);
        stats.setReviews_count(0);
        userInfo.setStats(stats);

        return userInfo;
    }

    /**
     * Create social auth failed error
     */
    private SocialLoginErrorResponse createSocialAuthFailedError(String details) {
        SocialLoginErrorResponse error = new SocialLoginErrorResponse();
        error.setStatus("error");
        error.setMessage("Failed to authenticate with social provider");
        error.setError_code("SOCIAL_AUTH_FAILED");
        error.setDetails(details);
        return error;
    }

    /**
     * Internal class to hold social user information
     * In real implementation, this would be populated from OAuth provider response
     */
    private static class SocialUserInfo {
        String socialId;
        String email;
        String fullName;
        String profilePicture;
    }
}
