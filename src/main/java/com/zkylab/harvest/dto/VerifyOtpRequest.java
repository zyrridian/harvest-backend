package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Schema(description = "OTP verification request")
public class VerifyOtpRequest {
    @NotNull(message = "OTP code is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP code must be exactly 6 digits")
    @Schema(description = "6-digit OTP code", example = "123456")
    private String otp_code;

    @NotNull(message = "Verification ID is required")
    @Schema(description = "Verification ID from registration response", example = "ver_1234567890abcdef")
    private String verification_id;

    public String getOtp_code() {
        return otp_code;
    }

    public void setOtp_code(String otp_code) {
        this.otp_code = otp_code;
    }

    public String getVerification_id() {
        return verification_id;
    }

    public void setVerification_id(String verification_id) {
        this.verification_id = verification_id;
    }
}

