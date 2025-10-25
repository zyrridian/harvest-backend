package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.*;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Token Service - Handles token refresh and logout
 * 
 * This service manages:
 * - Refreshing access tokens using refresh tokens
 * - User logout
 * 
 * Note: Token blacklisting is not implemented yet.
 * For production, consider using Redis to store invalidated tokens.
 */
@Service
public class TokenService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public TokenService(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Refresh access token using refresh token
     * 
     * @param request Refresh token request
     * @return RefreshTokenResponse on success, TokenErrorResponse on failure
     */
    public Object refreshToken(RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefresh_token();
            
            // Extract user info from refresh token
            String email = jwtService.extractEmail(refreshToken);
            Long userId = jwtService.extractUserId(refreshToken);
            
            // Verify token is not expired
            if (jwtService.isTokenExpired(refreshToken)) {
                return createTokenError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
            }
            
            // Find user to ensure they still exist
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return createTokenError("User not found", "USER_NOT_FOUND");
            }
            
            User user = userOptional.get();
            
            // Check if account is active
            if (!"active".equals(user.getAccountStatus())) {
                return createTokenError("Account is not active", "ACCOUNT_INACTIVE");
            }
            
            // Generate new tokens
            String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), false);
            String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());
            
            // Build response
            RefreshTokenResponse response = new RefreshTokenResponse();
            response.setStatus("success");
            
            RefreshTokenResponse.Data data = new RefreshTokenResponse.Data();
            data.setAccess_token(newAccessToken);
            data.setRefresh_token(newRefreshToken);
            data.setToken_type("Bearer");
            data.setExpires_in(jwtService.getExpirationTimeInSeconds(false));
            
            response.setData(data);
            return response;
            
        } catch (Exception e) {
            return createTokenError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
        }
    }

    /**
     * Logout user
     * 
     * @param request Logout request with optional logout_all_devices flag
     * @param authorizationHeader Authorization header with Bearer token
     * @return LogoutResponse
     * 
     * Note: Currently, this is a simple logout that returns success.
     * In production, you should:
     * 1. Add token to blacklist (use Redis)
     * 2. If logout_all_devices is true, invalidate all user's tokens
     * 3. Store device sessions in database and clear them
     */
    public Object logout(LogoutRequest request, String authorizationHeader) {
        try {
            // Extract token from Authorization header
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                
                // Verify token and get user
                String email = jwtService.extractEmail(token);
                
                // TODO: Add token to blacklist in Redis
                // TODO: If logout_all_devices is true, invalidate all user sessions
                
                // For now, just return success
                LogoutResponse response = new LogoutResponse();
                response.setStatus("success");
                
                if (request.getLogout_all_devices() != null && request.getLogout_all_devices()) {
                    response.setMessage("Logged out from all devices successfully");
                } else {
                    response.setMessage("Logged out successfully");
                }
                
                return response;
            } else {
                return createTokenError("Authorization header missing or invalid", "MISSING_TOKEN");
            }
        } catch (Exception e) {
            return createTokenError("Invalid token", "INVALID_TOKEN");
        }
    }

    /**
     * Create token error response
     */
    private TokenErrorResponse createTokenError(String message, String errorCode) {
        TokenErrorResponse error = new TokenErrorResponse();
        error.setStatus("error");
        error.setMessage(message);
        error.setError_code(errorCode);
        return error;
    }
}
