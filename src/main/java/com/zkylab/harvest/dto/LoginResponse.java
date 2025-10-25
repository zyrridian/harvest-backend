package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;
import java.util.List;

@Schema(description = "Login success response")
public class LoginResponse {

    @Schema(description = "Response status", example = "success")
    private String status;

    @Schema(description = "Response message", example = "Login successful")
    private String message;

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

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }

    @Schema(description = "Login response data")
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
        private UserInfo user;

        @Schema(description = "User permissions")
        private List<String> permissions;

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

        public UserInfo getUser() {
            return user;
        }

        public void setUser(UserInfo user) {
            this.user = user;
        }

        public List<String> getPermissions() {
            return permissions;
        }

        public void setPermissions(List<String> permissions) {
            this.permissions = permissions;
        }
    }

    @Schema(description = "User information")
    public static class UserInfo {
        @Schema(description = "User ID", example = "usr_1234567890abcdef")
        private String user_id;

        @Schema(description = "Email", example = "john@example.com")
        private String email;

        @Schema(description = "Phone number", example = "+6281234567890")
        private String phone;

        @Schema(description = "Full name", example = "John Doe")
        private String full_name;

        @Schema(description = "User type", example = "producer")
        private String user_type;

        @Schema(description = "Profile picture URL", example = "https://cdn.farmmarket.com/profiles/usr_123.jpg")
        private String profile_picture;

        @Schema(description = "Verification status", example = "true")
        private Boolean is_verified;

        @Schema(description = "Profile completion status", example = "true")
        private Boolean is_profile_complete;

        @Schema(description = "Verification status details")
        private VerificationStatus verification_status;

        @Schema(description = "User preferences")
        private Preferences preferences;

        @Schema(description = "User statistics")
        private Stats stats;

        // Getters and Setters
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

        public Boolean getIs_verified() {
            return is_verified;
        }

        public void setIs_verified(Boolean is_verified) {
            this.is_verified = is_verified;
        }

        public Boolean getIs_profile_complete() {
            return is_profile_complete;
        }

        public void setIs_profile_complete(Boolean is_profile_complete) {
            this.is_profile_complete = is_profile_complete;
        }

        public VerificationStatus getVerification_status() {
            return verification_status;
        }

        public void setVerification_status(VerificationStatus verification_status) {
            this.verification_status = verification_status;
        }

        public Preferences getPreferences() {
            return preferences;
        }

        public void setPreferences(Preferences preferences) {
            this.preferences = preferences;
        }

        public Stats getStats() {
            return stats;
        }

        public void setStats(Stats stats) {
            this.stats = stats;
        }
    }

    @Schema(description = "Verification status")
    public static class VerificationStatus {
        @Schema(description = "Email verified", example = "true")
        private Boolean email_verified;

        @Schema(description = "Phone verified", example = "true")
        private Boolean phone_verified;

        @Schema(description = "Business verified", example = "true")
        private Boolean business_verified;

        @Schema(description = "Business verification date", example = "2025-09-15T08:30:00Z")
        private ZonedDateTime business_verified_at;

        // Getters and Setters
        public Boolean getEmail_verified() {
            return email_verified;
        }

        public void setEmail_verified(Boolean email_verified) {
            this.email_verified = email_verified;
        }

        public Boolean getPhone_verified() {
            return phone_verified;
        }

        public void setPhone_verified(Boolean phone_verified) {
            this.phone_verified = phone_verified;
        }

        public Boolean getBusiness_verified() {
            return business_verified;
        }

        public void setBusiness_verified(Boolean business_verified) {
            this.business_verified = business_verified;
        }

        public ZonedDateTime getBusiness_verified_at() {
            return business_verified_at;
        }

        public void setBusiness_verified_at(ZonedDateTime business_verified_at) {
            this.business_verified_at = business_verified_at;
        }
    }

    @Schema(description = "User preferences")
    public static class Preferences {
        @Schema(description = "Language", example = "en")
        private String language;

        @Schema(description = "Currency", example = "IDR")
        private String currency;

        @Schema(description = "Notifications enabled", example = "true")
        private Boolean notifications_enabled;

        @Schema(description = "Theme", example = "light")
        private String theme;

        // Getters and Setters
        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public Boolean getNotifications_enabled() {
            return notifications_enabled;
        }

        public void setNotifications_enabled(Boolean notifications_enabled) {
            this.notifications_enabled = notifications_enabled;
        }

        public String getTheme() {
            return theme;
        }

        public void setTheme(String theme) {
            this.theme = theme;
        }
    }

    @Schema(description = "User statistics")
    public static class Stats {
        @Schema(description = "Total orders", example = "45")
        private Integer total_orders;

        @Schema(description = "Total spent (for buyers)", example = "1250000")
        private Long total_spent;

        @Schema(description = "Total sales (for producers)", example = "5000000")
        private Long total_sales;

        @Schema(description = "Rating", example = "4.8")
        private Double rating;

        @Schema(description = "Reviews count", example = "23")
        private Integer reviews_count;

        // Getters and Setters
        public Integer getTotal_orders() {
            return total_orders;
        }

        public void setTotal_orders(Integer total_orders) {
            this.total_orders = total_orders;
        }

        public Long getTotal_spent() {
            return total_spent;
        }

        public void setTotal_spent(Long total_spent) {
            this.total_spent = total_spent;
        }

        public Long getTotal_sales() {
            return total_sales;
        }

        public void setTotal_sales(Long total_sales) {
            this.total_sales = total_sales;
        }

        public Double getRating() {
            return rating;
        }

        public void setRating(Double rating) {
            this.rating = rating;
        }

        public Integer getReviews_count() {
            return reviews_count;
        }

        public void setReviews_count(Integer reviews_count) {
            this.reviews_count = reviews_count;
        }
    }
}
