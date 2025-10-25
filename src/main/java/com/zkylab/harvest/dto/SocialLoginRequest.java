package com.zkylab.harvest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Social login request")
public class SocialLoginRequest {

    @NotNull(message = "Provider is required")
    @Pattern(regexp = "google|facebook|apple", message = "Provider must be google, facebook, or apple")
    @Schema(description = "Social provider", example = "google", allowableValues = {"google", "facebook", "apple"})
    private String provider;

    @NotNull(message = "Access token is required")
    @Schema(description = "Social provider access token", example = "social_provider_access_token")
    private String access_token;

    @Pattern(regexp = "producer|buyer|both", message = "User type must be producer, buyer, or both")
    @Schema(description = "User type (required for new users)", example = "producer", allowableValues = {"producer", "buyer", "both"})
    private String user_type;

    @Valid
    @Schema(description = "Additional information for new users")
    private AdditionalInfo additional_info;

    // Getters and Setters
    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getAccess_token() {
        return access_token;
    }

    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }

    public String getUser_type() {
        return user_type;
    }

    public void setUser_type(String user_type) {
        this.user_type = user_type;
    }

    public AdditionalInfo getAdditional_info() {
        return additional_info;
    }

    public void setAdditional_info(AdditionalInfo additional_info) {
        this.additional_info = additional_info;
    }

    @Schema(description = "Additional user information")
    public static class AdditionalInfo {
        @Schema(description = "Phone number with country code", example = "+6281234567890")
        private String phone;

        @Valid
        @Schema(description = "Location information")
        private Location location;

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Location getLocation() {
            return location;
        }

        public void setLocation(Location location) {
            this.location = location;
        }
    }

    @Schema(description = "Location information")
    public static class Location {
        @Schema(description = "Province name", example = "West Java")
        private String province;

        @Schema(description = "City name", example = "Bandung")
        private String city;

        @Schema(description = "Latitude", example = "-6.914744")
        private Double latitude;

        @Schema(description = "Longitude", example = "107.609810")
        private Double longitude;

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
    }
}
