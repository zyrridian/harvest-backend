package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Social login response")
public class SocialLoginResponse {

    @Schema(description = "Response status", example = "success")
    private String status;

    @Schema(description = "Response message", example = "Login successful")
    private String message;

    @Schema(description = "Is this a new user", example = "false")
    private Boolean is_new_user;

    @Schema(description = "Requires profile completion", example = "false")
    private Boolean requires_profile_completion;

    @Schema(description = "Login data")
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

    public Boolean getIs_new_user() {
        return is_new_user;
    }

    public void setIs_new_user(Boolean is_new_user) {
        this.is_new_user = is_new_user;
    }

    public Boolean getRequires_profile_completion() {
        return requires_profile_completion;
    }

    public void setRequires_profile_completion(Boolean requires_profile_completion) {
        this.requires_profile_completion = requires_profile_completion;
    }

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }

    @Schema(description = "Social login response data")
    public static class Data {
        @Schema(description = "Access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String access_token;

        @Schema(description = "Refresh token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String refresh_token;

        @Schema(description = "Token type", example = "Bearer")
        private String token_type;

        @Schema(description = "Token expiration in seconds", example = "3600")
        private Integer expires_in;

        @Schema(description = "User information")
        private LoginResponse.UserInfo user;

        @Schema(description = "Next step for new users", example = "complete_profile")
        private String next_step;

        // Getters and Setters
        public String getAccess_token() {
            return access_token;
        }

        public void setAccess_token(String access_token) {
            this.access_token = access_token;
        }

        public String getRefresh_token() {
            return refresh_token;
        }

        public void setRefresh_token(String refresh_token) {
            this.refresh_token = refresh_token;
        }

        public String getToken_type() {
            return token_type;
        }

        public void setToken_type(String token_type) {
            this.token_type = token_type;
        }

        public Integer getExpires_in() {
            return expires_in;
        }

        public void setExpires_in(Integer expires_in) {
            this.expires_in = expires_in;
        }

        public LoginResponse.UserInfo getUser() {
            return user;
        }

        public void setUser(LoginResponse.UserInfo user) {
            this.user = user;
        }

        public String getNext_step() {
            return next_step;
        }

        public void setNext_step(String next_step) {
            this.next_step = next_step;
        }
    }
}
