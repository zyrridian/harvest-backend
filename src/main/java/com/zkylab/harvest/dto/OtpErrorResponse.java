package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;

@Schema(description = "OTP error response")
public class OtpErrorResponse {
    private String status;
    private String message;
    private String error_code;
    private Integer attempts_remaining;
    private Integer max_attempts;
    private ZonedDateTime can_resend_at;
    private Integer retry_after;

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

    public Integer getMax_attempts() {
        return max_attempts;
    }

    public void setMax_attempts(Integer max_attempts) {
        this.max_attempts = max_attempts;
    }

    public ZonedDateTime getCan_resend_at() {
        return can_resend_at;
    }

    public void setCan_resend_at(ZonedDateTime can_resend_at) {
        this.can_resend_at = can_resend_at;
    }

    public Integer getRetry_after() {
        return retry_after;
    }

    public void setRetry_after(Integer retry_after) {
        this.retry_after = retry_after;
    }
}
