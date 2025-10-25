package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Logout response")
public class LogoutResponse {

    @Schema(description = "Response status", example = "success")
    private String status;

    @Schema(description = "Response message", example = "Logged out successfully")
    private String message;

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
}
