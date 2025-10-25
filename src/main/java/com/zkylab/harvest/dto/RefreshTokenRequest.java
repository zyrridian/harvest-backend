package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Refresh token request")
public class RefreshTokenRequest {

    @NotNull(message = "Refresh token is required")
    @Schema(description = "Refresh token from login response", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refresh_token;

    // Getters and Setters
    public String getRefresh_token() {
        return refresh_token;
    }

    public void setRefresh_token(String refresh_token) {
        this.refresh_token = refresh_token;
    }
}
