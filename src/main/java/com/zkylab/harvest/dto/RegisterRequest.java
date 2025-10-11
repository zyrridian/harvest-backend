package com.zkylab.harvest.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User registration request")
public class RegisterRequest {
    @NotNull(message = "User type is required")
    @Pattern(regexp = "producer|buyer|both", message = "User type must be producer, buyer, or both")
    @Schema(description = "Type of user account", example = "producer", allowableValues = {"producer", "buyer", "both"})
    private String user_type;

    @NotNull(message = "Full name is required")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Full name must contain only letters and spaces")
    @Schema(description = "User's full name", example = "John Doe")
    private String full_name;

    @NotNull(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;

    @NotNull(message = "Phone is required")
    @Valid
    @Schema(description = "User's phone number with country code")
    private Phone phone;

    @NotNull(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "User password (min 8 chars, must contain uppercase, lowercase, number, special char)", example = "SecurePass123!")
    private String password;

    @NotNull(message = "Password confirmation is required")
    @Schema(description = "Password confirmation (must match password)", example = "SecurePass123!")
    private String confirm_password;

    @NotNull(message = "Location is required")
    @Valid
    @Schema(description = "User's location information")
    private Location location;

    @Schema(description = "Profile picture URL or base64 encoded image", example = "https://example.com/profile.jpg")
    private String profile_picture;

    @NotNull(message = "Terms acceptance is required")
    @Schema(description = "Terms and conditions acceptance (must be true)", example = "true")
    private Boolean terms_accepted;

    @Schema(description = "Marketing consent (optional)", example = "false")
    private Boolean marketing_consent;

    @Schema(description = "Referral code (optional)", example = "ABC123XYZ")
    private String referral_code;

    // Getters and Setters
    public String getUser_type() {
        return user_type;
    }

    public void setUser_type(String user_type) {
        this.user_type = user_type;
    }

    public String getFull_name() {
        return full_name;
    }

    public void setFull_name(String full_name) {
        this.full_name = full_name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Phone getPhone() {
        return phone;
    }

    public void setPhone(Phone phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirm_password() {
        return confirm_password;
    }

    public void setConfirm_password(String confirm_password) {
        this.confirm_password = confirm_password;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public String getProfile_picture() {
        return profile_picture;
    }

    public void setProfile_picture(String profile_picture) {
        this.profile_picture = profile_picture;
    }

    public Boolean getTerms_accepted() {
        return terms_accepted;
    }

    public void setTerms_accepted(Boolean terms_accepted) {
        this.terms_accepted = terms_accepted;
    }

    public Boolean getMarketing_consent() {
        return marketing_consent;
    }

    public void setMarketing_consent(Boolean marketing_consent) {
        this.marketing_consent = marketing_consent;
    }

    public String getReferral_code() {
        return referral_code;
    }

    public void setReferral_code(String referral_code) {
        this.referral_code = referral_code;
    }

    @Schema(description = "Phone number information")
    public static class Phone {
        @NotNull(message = "Country code is required")
        @Schema(description = "Country code with + prefix", example = "+62")
        private String country_code;

        @NotNull(message = "Phone number is required")
        @Pattern(regexp = "^\\d{9,15}$", message = "Phone number must be between 9 and 15 digits")
        @Schema(description = "Phone number (9-15 digits, without country code)", example = "81234567890")
        private String number;

        public String getCountry_code() {
            return country_code;
        }

        public void setCountry_code(String country_code) {
            this.country_code = country_code;
        }

        public String getNumber() {
            return number;
        }

        public void setNumber(String number) {
            this.number = number;
        }
    }

    @Schema(description = "Location information")
    public static class Location {
        @NotNull(message = "Province is required")
        @Schema(description = "Province name", example = "West Java")
        private String province;

        @NotNull(message = "Province ID is required")
        @Schema(description = "Province ID", example = "32")
        private Integer province_id;

        @NotNull(message = "City is required")
        @Schema(description = "City name", example = "Bandung")
        private String city;

        @NotNull(message = "City ID is required")
        @Schema(description = "City ID", example = "3273")
        private Integer city_id;

        @NotNull(message = "District is required")
        @Schema(description = "District name", example = "Coblong")
        private String district;

        @NotNull(message = "District ID is required")
        @Schema(description = "District ID", example = "327305")
        private Integer district_id;

        @NotNull(message = "Detailed address is required")
        @Schema(description = "Detailed address", example = "Jl. Example No. 123")
        private String detailed_address;

        @NotNull(message = "Postal code is required")
        @Schema(description = "Postal code", example = "40132")
        private String postal_code;

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
        @Schema(description = "Latitude coordinate", example = "-6.914744")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
        @Schema(description = "Longitude coordinate", example = "107.609810")
        private Double longitude;

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public Integer getProvince_id() {
            return province_id;
        }

        public void setProvince_id(Integer province_id) {
            this.province_id = province_id;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public Integer getCity_id() {
            return city_id;
        }

        public void setCity_id(Integer city_id) {
            this.city_id = city_id;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public Integer getDistrict_id() {
            return district_id;
        }

        public void setDistrict_id(Integer district_id) {
            this.district_id = district_id;
        }

        public String getDetailed_address() {
            return detailed_address;
        }

        public void setDetailed_address(String detailed_address) {
            this.detailed_address = detailed_address;
        }

        public String getPostal_code() {
            return postal_code;
        }

        public void setPostal_code(String postal_code) {
            this.postal_code = postal_code;
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
