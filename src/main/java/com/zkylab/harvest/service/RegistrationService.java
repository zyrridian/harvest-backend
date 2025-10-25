package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.RegisterRequest;
import com.zkylab.harvest.dto.RegisterResponse;
import com.zkylab.harvest.dto.ErrorResponse;
import com.zkylab.harvest.model.OtpVerification;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.*;

@Service
public class RegistrationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public RegistrationService(UserRepository userRepository, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    public Object register(RegisterRequest request) {
        Map<String, List<String>> errors = new HashMap<>();

        // Validate password rules
        if (!isValidPassword(request.getPassword())) {
            errors.computeIfAbsent("password", k -> new ArrayList<>())
                    .add("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }

        // Validate password match
        if (!Objects.equals(request.getPassword(), request.getConfirm_password())) {
            errors.computeIfAbsent("confirm_password", k -> new ArrayList<>())
                    .add("Passwords do not match");
        }

        // Check terms_accepted
        if (request.getTerms_accepted() == null || !request.getTerms_accepted()) {
            errors.computeIfAbsent("terms_accepted", k -> new ArrayList<>())
                    .add("Terms must be accepted");
        }

        // Check for unique email and phone
        if (userRepository.existsByEmail(request.getEmail())) {
            errors.computeIfAbsent("email", k -> new ArrayList<>())
                    .add("Email is already registered");
        }

        String fullPhoneNumber = request.getPhone().getCountry_code() + request.getPhone().getNumber();
        if (userRepository.existsByPhoneNumber(fullPhoneNumber)) {
            errors.computeIfAbsent("phone", k -> new ArrayList<>())
                    .add("Phone number is already in use");
        }

        // If validation errors exist, return error response
        if (!errors.isEmpty()) {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setStatus("error");
            errorResponse.setMessage("Validation failed");
            errorResponse.setErrors(errors.entrySet().stream().collect(
                    java.util.stream.Collectors.toMap(Map.Entry::getKey, e -> e.getValue().toArray(new String[0]))));
            errorResponse.setError_code("VALIDATION_ERROR");
            return errorResponse;
        }

        // Create and save user
        User user = new User();
        user.setUsername(request.getEmail()); // Set username to email
        user.setFullName(request.getFull_name());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(fullPhoneNumber);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUserType(request.getUser_type());
        user.setProvince(request.getLocation().getProvince());
        user.setCity(request.getLocation().getCity());
        user.setDistrict(request.getLocation().getDistrict());
        user.setDetailedAddress(request.getLocation().getDetailed_address());
        user.setPostalCode(request.getLocation().getPostal_code());
        user.setLatitude(request.getLocation().getLatitude());
        user.setLongitude(request.getLocation().getLongitude());
        user.setProfilePicture(request.getProfile_picture());
        user.setMarketingConsent(request.getMarketing_consent() != null ? request.getMarketing_consent() : false);
        user.setReferralCode(request.getReferral_code());
        user.setCreatedAt(ZonedDateTime.now());

        userRepository.save(user);

        // Create OTP verification
        OtpVerification otpVerification = otpService.createOtpVerification(user.getPhoneNumber(), user.getId());

        // Build success response
        RegisterResponse response = new RegisterResponse();
        response.setStatus("success");
        response.setMessage("Registration successful. Please verify your phone number.");

        RegisterResponse.Data data = new RegisterResponse.Data();
        data.setUser_id("usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        data.setEmail(user.getEmail());
        data.setPhone(user.getPhoneNumber());
        data.setFull_name(user.getFullName());
        data.setUser_type(user.getUserType());
        data.setVerification_required(true);
        data.setVerification_method("otp");
        data.setOtp_sent_to(user.getPhoneNumber());
        data.setOtp_expires_at(otpVerification.getExpiresAt());
        data.setSession_token("temp_" + otpVerification.getVerificationId());
        data.setCreated_at(user.getCreatedAt());

        response.setData(data);
        return response;
    }

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
