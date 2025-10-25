package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Reset password response")
public class ResetPasswordResponse {

    @Schema(description = "Response status", example = "success")
    private String status;

    @Schema(description = "Response message", example = "Password has been reset successfully")
    private String message;

    @Schema(description = "User data")
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

    @Schema(description = "Reset password data")
    public static class Data {
        @Schema(description = "User ID", example = "usr_1234567890abcdef")
        private String user_id;

        // Getters and Setters
        public String getUser_id() {
            return user_id;
        }

        public void setUser_id(String user_id) {
            this.user_id = user_id;
        }
    }
}
