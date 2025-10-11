package com.zkylab.harvest.dto;

import java.time.ZonedDateTime;

public class RegisterResponse {
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
        private String email;
        private String phone;
        private String full_name;
        private String user_type;
        private boolean verification_required;
        private String verification_method;
        private String otp_sent_to;
        private ZonedDateTime otp_expires_at;
        private String session_token;
        private ZonedDateTime created_at;

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

        public boolean isVerification_required() {
            return verification_required;
        }

        public void setVerification_required(boolean verification_required) {
            this.verification_required = verification_required;
        }

        public String getVerification_method() {
            return verification_method;
        }

        public void setVerification_method(String verification_method) {
            this.verification_method = verification_method;
        }

        public String getOtp_sent_to() {
            return otp_sent_to;
        }

        public void setOtp_sent_to(String otp_sent_to) {
            this.otp_sent_to = otp_sent_to;
        }

        public ZonedDateTime getOtp_expires_at() {
            return otp_expires_at;
        }

        public void setOtp_expires_at(ZonedDateTime otp_expires_at) {
            this.otp_expires_at = otp_expires_at;
        }

        public String getSession_token() {
            return session_token;
        }

        public void setSession_token(String session_token) {
            this.session_token = session_token;
        }

        public ZonedDateTime getCreated_at() {
            return created_at;
        }

        public void setCreated_at(ZonedDateTime created_at) {
            this.created_at = created_at;
        }
    }
}

