package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.*;
import com.zkylab.harvest.model.BiometricAuth;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.BiometricAuthRepository;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * BiometricService - Handles biometric authentication registration and login
 * 
 * This service manages biometric device registration and authentication.
 * Currently uses mock validation - ready for integration with actual biometric verification.
 */
@Service
public class BiometricService {

    private final BiometricAuthRepository biometricAuthRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public BiometricService(BiometricAuthRepository biometricAuthRepository, 
                          UserRepository userRepository, 
                          JwtService jwtService) {
        this.biometricAuthRepository = biometricAuthRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Register a device for biometric authentication
     * 
     * @param request BiometricRegisterRequest containing user and device info
     * @return BiometricRegisterResponse with registration status
     */
    public Object registerBiometric(BiometricRegisterRequest request) {
        try {
            // Find user by email or phone
            Optional<User> userOpt = userRepository.findByEmail(request.getIdentifier());
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByPhoneNumber(request.getIdentifier());
            }

            if (userOpt.isEmpty()) {
                BiometricRegisterResponse response = new BiometricRegisterResponse();
                response.setSuccess(false);
                response.setMessage("User not found");
                return response;
            }

            User user = userOpt.get();

            // Check if device is already registered
            Optional<BiometricAuth> existingAuth = biometricAuthRepository.findByDeviceId(request.getDevice_id());
            if (existingAuth.isPresent()) {
                BiometricRegisterResponse response = new BiometricRegisterResponse();
                response.setSuccess(false);
                response.setMessage("Device already registered for biometric authentication");
                return response;
            }

            // Create new biometric auth record
            BiometricAuth biometricAuth = new BiometricAuth(
                user,
                request.getDevice_id(),
                request.getDevice_name(),
                request.getPublic_key(),
                request.getBiometric_type(),
                request.getPlatform()
            );

            biometricAuthRepository.save(biometricAuth);

            // Generate success response
            BiometricRegisterResponse response = new BiometricRegisterResponse();
            response.setSuccess(true);
            response.setMessage("Biometric authentication registered successfully");
            response.setDevice_id(request.getDevice_id());
            response.setRegistered_at(biometricAuth.getRegisteredAt().toString());

            return response;

        } catch (Exception e) {
            BiometricRegisterResponse response = new BiometricRegisterResponse();
            response.setSuccess(false);
            response.setMessage("Failed to register biometric authentication: " + e.getMessage());
            return response;
        }
    }

    /**
     * Authenticate user using biometric data
     * 
     * @param request BiometricLoginRequest containing device and biometric token
     * @return BiometricLoginResponse with authentication result and tokens
     */
    public Object biometricLogin(BiometricLoginRequest request) {
        try {
            // Find biometric auth record by device ID
            Optional<BiometricAuth> biometricAuthOpt = biometricAuthRepository
                .findByDeviceIdAndIsActive(request.getDevice_id(), true);

            if (biometricAuthOpt.isEmpty()) {
                BiometricLoginResponse response = new BiometricLoginResponse();
                response.setSuccess(false);
                response.setMessage("Device not registered for biometric authentication");
                return response;
            }

            BiometricAuth biometricAuth = biometricAuthOpt.get();
            User user = biometricAuth.getUser();

            // TODO: In production, verify the biometric_token signature using the stored public_key
            // For now, we'll use mock validation
            boolean isValidBiometric = mockValidateBiometric(
                request.getBiometric_token(), 
                biometricAuth.getPublicKey(),
                request.getChallenge()
            );

            if (!isValidBiometric) {
                BiometricLoginResponse response = new BiometricLoginResponse();
                response.setSuccess(false);
                response.setMessage("Biometric authentication failed");
                return response;
            }

            // Check if user account is active
            if (user.getIsAccountLocked() != null && user.getIsAccountLocked()) {
                BiometricLoginResponse response = new BiometricLoginResponse();
                response.setSuccess(false);
                response.setMessage("Account is locked");
                return response;
            }

            // Update last used timestamp
            biometricAuth.setLastUsedAt(LocalDateTime.now());
            biometricAuthRepository.save(biometricAuth);

            // Generate JWT tokens
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), false);
            String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

            // Create success response
            BiometricLoginResponse response = new BiometricLoginResponse();
            response.setSuccess(true);
            response.setMessage("Biometric login successful");
            response.setAccessToken(accessToken);
            response.setRefreshToken(refreshToken);

            return response;

        } catch (Exception e) {
            BiometricLoginResponse response = new BiometricLoginResponse();
            response.setSuccess(false);
            response.setMessage("Biometric login failed: " + e.getMessage());
            return response;
        }
    }

    /**
     * Mock biometric validation
     * 
     * In production, this should:
     * 1. Verify the signature using the stored public key
     * 2. Validate the challenge to prevent replay attacks
     * 3. Check signature timestamp
     * 
     * @param biometricToken The biometric signature/token from the client
     * @param publicKey The stored public key for this device
     * @param challenge Server-issued challenge
     * @return true if valid, false otherwise
     */
    private boolean mockValidateBiometric(String biometricToken, String publicKey, String challenge) {
        // Mock validation - always returns true for now
        // In production, implement actual signature verification
        return biometricToken != null && !biometricToken.isEmpty();
    }
}
