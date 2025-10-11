package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OTP verification success response")
public class VerifyOtpResponse {
    private String status;
    private String message;
    private Data data;

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

    public static class Data {
        private String user_id;
        private boolean verified;
        private String access_token;
        private String refresh_token;
        private String token_type;
        private int expires_in;
        private UserInfo user;

        public String getUser_id() {
            return user_id;
        }

        public void setUser_id(String user_id) {
            this.user_id = user_id;
        }

        public boolean isVerified() {
            return verified;
        }

        public void setVerified(boolean verified) {
            this.verified = verified;
        }

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

        public int getExpires_in() {
            return expires_in;
        }

        public void setExpires_in(int expires_in) {
            this.expires_in = expires_in;
        }

        public UserInfo getUser() {
            return user;
        }

        public void setUser(UserInfo user) {
            this.user = user;
        }
    }

    public static class UserInfo {
        private String user_id;
        private String email;
        private String phone;
        private String full_name;
        private String user_type;
        private String profile_picture;
        private boolean is_verified;
        private boolean is_profile_complete;
        private VerificationStatus verification_status;

        public String getUser_id() {
            return user_id;
        }

        public void setUser_id(String user_id) {
            this.user_id = user_id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getFull_name() {
            return full_name;
        }

        public void setFull_name(String full_name) {
            this.full_name = full_name;
        }

        public String getUser_type() {
            return user_type;
        }

        public void setUser_type(String user_type) {
            this.user_type = user_type;
        }

        public String getProfile_picture() {
            return profile_picture;
        }

        public void setProfile_picture(String profile_picture) {
            this.profile_picture = profile_picture;
        }

        public boolean isIs_verified() {
            return is_verified;
        }

        public void setIs_verified(boolean is_verified) {
            this.is_verified = is_verified;
        }

        public boolean isIs_profile_complete() {
            return is_profile_complete;
        }

        public void setIs_profile_complete(boolean is_profile_complete) {
            this.is_profile_complete = is_profile_complete;
        }

        public VerificationStatus getVerification_status() {
            return verification_status;
        }

        public void setVerification_status(VerificationStatus verification_status) {
            this.verification_status = verification_status;
        }
    }

    public static class VerificationStatus {
        private boolean email_verified;
        private boolean phone_verified;
        private boolean business_verified;

        public boolean isEmail_verified() {
            return email_verified;
        }

        public void setEmail_verified(boolean email_verified) {
            this.email_verified = email_verified;
        }

        public boolean isPhone_verified() {
            return phone_verified;
        }

        public void setPhone_verified(boolean phone_verified) {
            this.phone_verified = phone_verified;
        }

        public boolean isBusiness_verified() {
            return business_verified;
        }

        public void setBusiness_verified(boolean business_verified) {
            this.business_verified = business_verified;
        }
    }
}

