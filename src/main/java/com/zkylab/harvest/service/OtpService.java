package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.*;
import com.zkylab.harvest.model.OtpVerification;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.OtpVerificationRepository;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class OtpService {
    private final OtpVerificationRepository otpVerificationRepository;
    private final UserRepository userRepository;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    public OtpService(OtpVerificationRepository otpVerificationRepository, UserRepository userRepository) {
        this.otpVerificationRepository = otpVerificationRepository;
        this.userRepository = userRepository;
    }

    public OtpVerification createOtpVerification(String phoneNumber, Long userId) {
        String otpCode = generateOtpCode();
        String verificationId = "ver_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setVerificationId(verificationId);
        otpVerification.setUserId(userId);
        otpVerification.setOtpCode(otpCode);
        otpVerification.setPhoneNumber(phoneNumber);
        otpVerification.setExpiresAt(ZonedDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otpVerification.setCreatedAt(ZonedDateTime.now());

        // TODO: Send OTP via SMS service
        System.out.println("OTP Code for " + phoneNumber + ": " + otpCode);

        return otpVerificationRepository.save(otpVerification);
    }

    public Object verifyOtp(VerifyOtpRequest request) {
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findByVerificationId(request.getVerification_id());

        if (otpOpt.isEmpty()) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("Invalid verification ID");
            error.setError_code("INVALID_VERIFICATION_ID");
            return error;
        }

        OtpVerification otp = otpOpt.get();

        // Check if already verified
        if (otp.getVerified()) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("OTP already verified");
            error.setError_code("ALREADY_VERIFIED");
            return error;
        }

        // Check if expired
        if (ZonedDateTime.now().isAfter(otp.getExpiresAt())) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("OTP code has expired. Please request a new one.");
            error.setError_code("OTP_EXPIRED");
            return error;
        }

        // Check max attempts
        if (otp.getAttempts() >= otp.getMaxAttempts()) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("Maximum OTP attempts exceeded. Please request a new code.");
            error.setError_code("MAX_ATTEMPTS_EXCEEDED");
            error.setCan_resend_at(ZonedDateTime.now().plusMinutes(5));
            return error;
        }

        // Increment attempts
        otp.setAttempts(otp.getAttempts() + 1);
        otpVerificationRepository.save(otp);

        // Verify OTP code
        if (!otp.getOtpCode().equals(request.getOtp_code())) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("Invalid or expired OTP code");
            error.setError_code("INVALID_OTP");
            error.setAttempts_remaining(otp.getMaxAttempts() - otp.getAttempts());
            error.setMax_attempts(otp.getMaxAttempts());
            return error;
        }

        // Mark as verified
        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        // Get user and build response
        Optional<User> userOpt = userRepository.findById(otp.getUserId());
        if (userOpt.isEmpty()) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("User not found");
            error.setError_code("USER_NOT_FOUND");
            return error;
        }

        User user = userOpt.get();
        String userId = "usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        VerifyOtpResponse response = new VerifyOtpResponse();
        response.setStatus("success");
        response.setMessage("Phone number verified successfully");

        VerifyOtpResponse.Data data = new VerifyOtpResponse.Data();
        data.setUser_id(userId);
        data.setVerified(true);
        data.setAccess_token("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." + UUID.randomUUID());
        data.setRefresh_token("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." + UUID.randomUUID());
        data.setToken_type("Bearer");
        data.setExpires_in(3600);

        VerifyOtpResponse.UserInfo userInfo = new VerifyOtpResponse.UserInfo();
        userInfo.setUser_id(userId);
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhoneNumber());
        userInfo.setFull_name(user.getFullName());
        userInfo.setUser_type(user.getUserType());
        userInfo.setProfile_picture(user.getProfilePicture());
        userInfo.setIs_verified(true);
        userInfo.setIs_profile_complete(false);

        VerifyOtpResponse.VerificationStatus verificationStatus = new VerifyOtpResponse.VerificationStatus();
        verificationStatus.setEmail_verified(false);
        verificationStatus.setPhone_verified(true);
        verificationStatus.setBusiness_verified(false);

        userInfo.setVerification_status(verificationStatus);
        data.setUser(userInfo);
        response.setData(data);

        return response;
    }

    public Object resendOtp(ResendOtpRequest request) {
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findByVerificationId(request.getVerification_id());

        if (otpOpt.isEmpty()) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("Invalid verification ID");
            error.setError_code("INVALID_VERIFICATION_ID");
            return error;
        }

        OtpVerification otp = otpOpt.get();

        // Check if already verified
        if (otp.getVerified()) {
            OtpErrorResponse error = new OtpErrorResponse();
            error.setStatus("error");
            error.setMessage("Phone number already verified");
            error.setError_code("ALREADY_VERIFIED");
            return error;
        }

        // Check cooldown period
        if (otp.getLastResentAt() != null) {
            ZonedDateTime canResendAt = otp.getLastResentAt().plusSeconds(RESEND_COOLDOWN_SECONDS);
            if (ZonedDateTime.now().isBefore(canResendAt)) {
                OtpErrorResponse error = new OtpErrorResponse();
                error.setStatus("error");
                error.setMessage("Please wait before requesting another OTP");
                error.setError_code("RESEND_COOLDOWN");
                error.setRetry_after((int) java.time.Duration.between(ZonedDateTime.now(), canResendAt).getSeconds());
                return error;
            }
        }

        // Generate new OTP
        String newOtpCode = generateOtpCode();
        otp.setOtpCode(newOtpCode);
        otp.setExpiresAt(ZonedDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otp.setLastResentAt(ZonedDateTime.now());
        otp.setAttempts(0); // Reset attempts
        otpVerificationRepository.save(otp);

        // TODO: Send OTP via selected method (SMS/WhatsApp/Call)
        String method = request.getMethod() != null ? request.getMethod() : "sms";
        System.out.println("Resending OTP via " + method + " to " + otp.getPhoneNumber() + ": " + newOtpCode);

        ResendOtpResponse response = new ResendOtpResponse();
        response.setStatus("success");
        response.setMessage("OTP code has been resent");

        ResendOtpResponse.Data data = new ResendOtpResponse.Data();
        data.setVerification_id(otp.getVerificationId());
        data.setSent_to(otp.getPhoneNumber());
        data.setMethod(method);
        data.setExpires_at(otp.getExpiresAt());
        data.setCan_resend_at(ZonedDateTime.now().plusSeconds(RESEND_COOLDOWN_SECONDS));

        response.setData(data);
        return response;
    }

    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}

