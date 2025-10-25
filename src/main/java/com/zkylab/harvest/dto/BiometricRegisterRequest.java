package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Register biometric authentication for a device")
public class BiometricRegisterRequest {

    @NotNull
    @Schema(description = "Unique device identifier", example = "device-12345-xyz")
    private String device_id;

    @NotNull
    @Schema(description = "Biometric type", example = "fingerprint", allowableValues = {"fingerprint","face","iris"})
    private String biometric_type;

    @NotNull
    @Schema(description = "Base64-encoded public key for verifying biometric signatures")
    private String public_key;

    @Valid
    @Schema(description = "Device info")
    private DeviceInfo device_info;

    // Getters / Setters
    public String getDevice_id() { return device_id; }
    public void setDevice_id(String device_id) { this.device_id = device_id; }

    public String getBiometric_type() { return biometric_type; }
    public void setBiometric_type(String biometric_type) { this.biometric_type = biometric_type; }

    public String getPublic_key() { return public_key; }
    public void setPublic_key(String public_key) { this.public_key = public_key; }

    public DeviceInfo getDevice_info() { return device_info; }
    public void setDevice_info(DeviceInfo device_info) { this.device_info = device_info; }

    public static class DeviceInfo {
        private String device_name;
        private String os_version;
        public String getDevice_name() { return device_name; }
        public void setDevice_name(String device_name) { this.device_name = device_name; }
        public String getOs_version() { return os_version; }
        public void setOs_version(String os_version) { this.os_version = os_version; }
    }
}
