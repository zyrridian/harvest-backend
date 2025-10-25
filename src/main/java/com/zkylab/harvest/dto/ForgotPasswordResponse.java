package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;

@Schema(description = "Forgot password response")
public class ForgotPasswordResponse {

    @Schema(description = "Response status", example = "success")
    private String status;

    @Schema(description = "Response message", example = "Password reset code has been sent")
    private String message;

    @Schema(description = "Reset data")
    private Data data;

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

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }

    @Schema(description = "Password reset data")
    public static class Data {
        @Schema(description = "Temporary reset token", example = "temp_reset_token")
        private String reset_token;

        @Schema(description = "Where the code was sent", example = "john@example.com")
        private String sent_to;

        @Schema(description = "Delivery method", example = "email")
        private String method;

        @Schema(description = "Token expiration time", example = "2025-10-09T11:00:00Z")
        private ZonedDateTime expires_at;

        // Getters and Setters
        public String getReset_token() {
            return reset_token;
        }

        public void setReset_token(String reset_token) {
            this.reset_token = reset_token;
        }

        public String getSent_to() {
            return sent_to;
        }

        public void setSent_to(String sent_to) {
            this.sent_to = sent_to;
        }

        public String getMethod() {
            return method;
        }

        public void setMethod(String method) {
            this.method = method;
        }

        public ZonedDateTime getExpires_at() {
            return expires_at;
        }

        public void setExpires_at(ZonedDateTime expires_at) {
            this.expires_at = expires_at;
        }
    }
}
