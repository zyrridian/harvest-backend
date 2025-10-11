package com.zkylab.harvest.dto;

import java.util.Map;

public class ErrorResponse {
    private String status;
    private String message;
    private Map<String, String[]> errors;
    private String error_code;
    private String[] existing_fields;
    private Integer retry_after;

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

    public Map<String, String[]> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String[]> errors) {
        this.errors = errors;
    }

    public String getError_code() {
        return error_code;
    }

    public void setError_code(String error_code) {
        this.error_code = error_code;
    }

    public String[] getExisting_fields() {
        return existing_fields;
    }

    public void setExisting_fields(String[] existing_fields) {
        this.existing_fields = existing_fields;
    }

    public Integer getRetry_after() {
        return retry_after;
    }

    public void setRetry_after(Integer retry_after) {
        this.retry_after = retry_after;
    }
}

