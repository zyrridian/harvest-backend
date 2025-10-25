package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User login request")
public class LoginRequest {

    @NotNull(message = "Identifier is required")
    @Schema(description = "Email or phone number", example = "john@example.com")
    private String identifier;

    @NotNull(message = "Password is required")
    @Schema(description = "User password", example = "SecurePass123!")
    private String password;

    @Schema(description = "Remember me flag", example = "true")
    private Boolean remember_me;

    @Valid
    @Schema(description = "Device information")
    private DeviceInfo device_info;

    // Getters and Setters
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getRemember_me() {
        return remember_me;
    }

    public void setRemember_me(Boolean remember_me) {
        this.remember_me = remember_me;
    }

    public DeviceInfo getDevice_info() {
        return device_info;
    }

    public void setDevice_info(DeviceInfo device_info) {
        this.device_info = device_info;
    }

    @Schema(description = "Device information")
    public static class DeviceInfo {
        @Schema(description = "Device name", example = "Samsung Galaxy S21")
        private String device_name;

        @Schema(description = "OS version", example = "Android 12")
        private String os_version;

        @Schema(description = "FCM token for push notifications", example = "fcm_device_token_for_notifications")
        private String fcm_token;

        public String getDevice_name() {
            return device_name;
        }

        public void setDevice_name(String device_name) {
            this.device_name = device_name;
        }

        public String getOs_version() {
            return os_version;
        }

        public void setOs_version(String os_version) {
            this.os_version = os_version;
        }

        public String getFcm_token() {
            return fcm_token;
        }

        public void setFcm_token(String fcm_token) {
            this.fcm_token = fcm_token;
        }
    }
}
