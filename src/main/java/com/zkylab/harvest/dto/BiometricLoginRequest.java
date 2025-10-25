package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Biometric login request")
public class BiometricLoginRequest {
    @NotNull
    @Schema(description = "Device identifier", example = "device-12345-xyz")
    private String device_id;

    @NotNull
    @Schema(description = "Encrypted biometric signature/token")
    private String biometric_token;

    @Schema(description = "Server challenge used to verify signature")
    private String challenge;

    public String getDevice_id() { return device_id; }
    public void setDevice_id(String device_id) { this.device_id = device_id; }
    public String getBiometric_token() { return biometric_token; }
    public void setBiometric_token(String biometric_token) { this.biometric_token = biometric_token; }
    public String getChallenge() { return challenge; }
    public void setChallenge(String challenge) { this.challenge = challenge; }
}
