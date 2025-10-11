package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;

@Schema(description = "Resend OTP success response")
public class ResendOtpResponse {
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
        private String verification_id;
        private String sent_to;
        private String method;
        private ZonedDateTime expires_at;
        private ZonedDateTime can_resend_at;

        public String getVerification_id() {
            return verification_id;
        }

        public void setVerification_id(String verification_id) {
            this.verification_id = verification_id;
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

        public ZonedDateTime getCan_resend_at() {
            return can_resend_at;
        }

        public void setCan_resend_at(ZonedDateTime can_resend_at) {
            this.can_resend_at = can_resend_at;
        }
    }
}

