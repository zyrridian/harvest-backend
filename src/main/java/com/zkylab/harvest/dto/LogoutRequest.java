package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Logout request")
public class LogoutRequest {

    @Schema(description = "Logout from all devices", example = "false")
    private Boolean logout_all_devices;

    // Getters and Setters
    public Boolean getLogout_all_devices() {
        return logout_all_devices;
    }

    public void setLogout_all_devices(Boolean logout_all_devices) {
        this.logout_all_devices = logout_all_devices;
    }
}
