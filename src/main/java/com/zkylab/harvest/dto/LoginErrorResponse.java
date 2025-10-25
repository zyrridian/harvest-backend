package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;

@Schema(description = "Login error response")
public class LoginErrorResponse {

    @Schema(description = "Response status", example = "error")
    private String status;

    @Schema(description = "Error message", example = "Invalid email/phone or password")
    private String message;

    @Schema(description = "Error code", example = "INVALID_CREDENTIALS")
    private String error_code;

    @Schema(description = "Remaining login attempts", example = "4")
    private Integer attempts_remaining;

    @Schema(description = "Account locked until timestamp", example = "2025-10-09T11:00:00Z")
    private ZonedDateTime locked_until;

    @Schema(description = "Contact support flag", example = "true")
    private Boolean contact_support;

    @Schema(description = "Suspension reason", example = "Terms violation")
    private String reason;

    @Schema(description = "Support email", example = "support@farmmarket.com")
    private String support_email;

    @Schema(description = "Additional data for specific errors")
    private ErrorData data;

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError_code() {
        return error_code;
    }

    public void setError_code(String error_code) {
        this.error_code = error_code;
    }

    public Integer getAttempts_remaining() {
        return attempts_remaining;
    }

    public void setAttempts_remaining(Integer attempts_remaining) {
        this.attempts_remaining = attempts_remaining;
    }

    public ZonedDateTime getLocked_until() {
        return locked_until;
    }

    public void setLocked_until(ZonedDateTime locked_until) {
        this.locked_until = locked_until;
    }

    public Boolean getContact_support() {
        return contact_support;
    }

    public void setContact_support(Boolean contact_support) {
        this.contact_support = contact_support;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSupport_email() {
        return support_email;
    }

    public void setSupport_email(String support_email) {
        this.support_email = support_email;
    }

    public ErrorData getData() {
        return data;
    }

    public void setData(ErrorData data) {
        this.data = data;
    }

    @Schema(description = "Error data for email verification required")
    public static class ErrorData {
        @Schema(description = "User ID", example = "usr_1234567890abcdef")
        private String user_id;

        @Schema(description = "Email", example = "john@example.com")
        private String email;

        @Schema(description = "Can resend verification email", example = "true")
        private Boolean can_resend_verification;

        // Getters and Setters
        public String getUser_id() {
            return user_id;
        }

        public void setUser_id(String user_id) {
            this.user_id = user_id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Boolean getCan_resend_verification() {
            return can_resend_verification;
        }

        public void setCan_resend_verification(Boolean can_resend_verification) {
            this.can_resend_verification = can_resend_verification;
        }
    }
}
