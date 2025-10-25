package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Token error response")
public class TokenErrorResponse {

    @Schema(description = "Response status", example = "error")
    private String status;

    @Schema(description = "Error message", example = "Invalid or expired refresh token")
    private String message;

    @Schema(description = "Error code", example = "INVALID_REFRESH_TOKEN")
    private String error_code;

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
}
