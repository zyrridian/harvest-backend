package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;

@Schema(description = "Biometric registration response")
public class BiometricRegisterResponse {
    private String status;
    private String message;
    private Data data;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Data getData() { return data; }
    public void setData(Data data) { this.data = data; }

    public static class Data {
        private String biometric_id;
        private String device_id;
        private ZonedDateTime enabled_at;

        public String getBiometric_id() { return biometric_id; }
        public void setBiometric_id(String biometric_id) { this.biometric_id = biometric_id; }
        public String getDevice_id() { return device_id; }
        public void setDevice_id(String device_id) { this.device_id = device_id; }
        public ZonedDateTime getEnabled_at() { return enabled_at; }
        public void setEnabled_at(ZonedDateTime enabled_at) { this.enabled_at = enabled_at; }
    }
}
