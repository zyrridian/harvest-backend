package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Change password request")
public class ChangePasswordRequest {

    @NotNull(message = "Current password is required")
    @Schema(description = "Current password", example = "OldPass123!")
    private String current_password;

    @NotNull(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "New password", example = "NewSecurePass123!")
    private String new_password;

    @NotNull(message = "Password confirmation is required")
    @Schema(description = "Confirm new password", example = "NewSecurePass123!")
    private String confirm_password;

    // Getters and Setters
    public String getCurrent_password() {
        return current_password;
    }

    public void setCurrent_password(String current_password) {
        this.current_password = current_password;
    }

    public String getNew_password() {
        return new_password;
    }

    public void setNew_password(String new_password) {
        this.new_password = new_password;
    }

    public String getConfirm_password() {
        return confirm_password;
    }

    public void setConfirm_password(String confirm_password) {
        this.confirm_password = confirm_password;
    }
}
