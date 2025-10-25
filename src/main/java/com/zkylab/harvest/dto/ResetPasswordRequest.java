package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Reset password request")
public class ResetPasswordRequest {

    @NotNull(message = "Reset token is required")
    @Schema(description = "Temporary reset token", example = "temp_reset_token")
    private String reset_token;

    @NotNull(message = "OTP code is required")
    @Schema(description = "OTP code sent to user", example = "123456")
    private String otp_code;

    @NotNull(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "New password", example = "NewSecurePass123!")
    private String new_password;

    @NotNull(message = "Password confirmation is required")
    @Schema(description = "Confirm new password", example = "NewSecurePass123!")
    private String confirm_password;

    // Getters and Setters
    public String getReset_token() {
        return reset_token;
    }

    public void setReset_token(String reset_token) {
        this.reset_token = reset_token;
    }

    public String getOtp_code() {
        return otp_code;
    }

    public void setOtp_code(String otp_code) {
        this.otp_code = otp_code;
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
