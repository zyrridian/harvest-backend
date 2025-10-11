package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resend OTP request")
public class ResendOtpRequest {
    @Schema(description = "Verification ID", example = "ver_1234567890abcdef", required = true)
    private String verification_id;

    @Schema(description = "OTP delivery method", example = "sms", allowableValues = {"sms", "whatsapp", "call"})
    private String method;

    public String getVerification_id() {
        return verification_id;
    }

    public void setVerification_id(String verification_id) {
        this.verification_id = verification_id;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}

