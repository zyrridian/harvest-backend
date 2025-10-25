package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Social login error response")
public class SocialLoginErrorResponse {

    @Schema(description = "Response status", example = "error")
    private String status;

    @Schema(description = "Error message", example = "Failed to authenticate with social provider")
    private String message;

    @Schema(description = "Error code", example = "SOCIAL_AUTH_FAILED")
    private String error_code;

    @Schema(description = "Error details", example = "Invalid access token")
    private String details;

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

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
