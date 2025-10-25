package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Forgot password request")
public class ForgotPasswordRequest {

    @NotNull(message = "Identifier is required")
    @Schema(description = "Email or phone number", example = "john@example.com")
    private String identifier;

    // Getters and Setters
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
