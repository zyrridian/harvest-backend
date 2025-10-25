package com.zkylab.harvest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Schema(description = "User profile response")
public class UserProfileResponse {
    private String status;
    private UserProfileData data;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UserProfileData getData() { return data; }
    public void setData(UserProfileData data) { this.data = data; }

    @Schema(description = "User profile data")
    public static class UserProfileData {
        private String user_id;
        private String email;
        private String phone;
        private String full_name;
        private String user_type;
        private String profile_picture;
        private String cover_photo;
        private String bio;
        private Location location;
        private VerificationStatus verification_status;
        private Stats stats;
        private Preferences preferences;
        private FarmDetails farm_details;
        private PaymentInfo payment_info;
        private ZonedDateTime created_at;
        private ZonedDateTime updated_at;
        private ZonedDateTime last_active_at;

        // Getters and Setters
        public String getUser_id() { return user_id; }
        public void setUser_id(String user_id) { this.user_id = user_id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getFull_name() { return full_name; }
        public void setFull_name(String full_name) { this.full_name = full_name; }
        public String getUser_type() { return user_type; }
        public void setUser_type(String user_type) { this.user_type = user_type; }
        public String getProfile_picture() { return profile_picture; }
        public void setProfile_picture(String profile_picture) { this.profile_picture = profile_picture; }
        public String getCover_photo() { return cover_photo; }
        public void setCover_photo(String cover_photo) { this.cover_photo = cover_photo; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public Location getLocation() { return location; }
        public void setLocation(Location location) { this.location = location; }
        public VerificationStatus getVerification_status() { return verification_status; }
        public void setVerification_status(VerificationStatus verification_status) { this.verification_status = verification_status; }
        public Stats getStats() { return stats; }
        public void setStats(Stats stats) { this.stats = stats; }
        public Preferences getPreferences() { return preferences; }
        public void setPreferences(Preferences preferences) { this.preferences = preferences; }
        public FarmDetails getFarm_details() { return farm_details; }
        public void setFarm_details(FarmDetails farm_details) { this.farm_details = farm_details; }
        public PaymentInfo getPayment_info() { return payment_info; }
        public void setPayment_info(PaymentInfo payment_info) { this.payment_info = payment_info; }
        public ZonedDateTime getCreated_at() { return created_at; }
        public void setCreated_at(ZonedDateTime created_at) { this.created_at = created_at; }
        public ZonedDateTime getUpdated_at() { return updated_at; }
        public void setUpdated_at(ZonedDateTime updated_at) { this.updated_at = updated_at; }
        public ZonedDateTime getLast_active_at() { return last_active_at; }
        public void setLast_active_at(ZonedDateTime last_active_at) { this.last_active_at = last_active_at; }
    }

    @Schema(description = "Location information")
    public static class Location {
        private String province;
        private Integer province_id;
        private String city;
        private Integer city_id;
        private String district;
        private String detailed_address;
        private Double latitude;
        private Double longitude;

        public String getProvince() { return province; }
        public void setProvince(String province) { this.province = province; }
        public Integer getProvince_id() { return province_id; }
        public void setProvince_id(Integer province_id) { this.province_id = province_id; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public Integer getCity_id() { return city_id; }
        public void setCity_id(Integer city_id) { this.city_id = city_id; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public String getDetailed_address() { return detailed_address; }
        public void setDetailed_address(String detailed_address) { this.detailed_address = detailed_address; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    @Schema(description = "Verification status")
    public static class VerificationStatus {
        private Boolean email_verified;
        private Boolean phone_verified;
        private Boolean business_verified;
        private Boolean verified_badge;
        private ZonedDateTime verified_at;

        public Boolean getEmail_verified() { return email_verified; }
        public void setEmail_verified(Boolean email_verified) { this.email_verified = email_verified; }
        public Boolean getPhone_verified() { return phone_verified; }
        public void setPhone_verified(Boolean phone_verified) { this.phone_verified = phone_verified; }
        public Boolean getBusiness_verified() { return business_verified; }
        public void setBusiness_verified(Boolean business_verified) { this.business_verified = business_verified; }
        public Boolean getVerified_badge() { return verified_badge; }
        public void setVerified_badge(Boolean verified_badge) { this.verified_badge = verified_badge; }
        public ZonedDateTime getVerified_at() { return verified_at; }
        public void setVerified_at(ZonedDateTime verified_at) { this.verified_at = verified_at; }
    }

    @Schema(description = "User statistics")
    public static class Stats {
        private Integer total_products;
        private Integer total_orders;
        private Long total_sales;
        private Double rating;
        private Integer reviews_count;
        private Integer followers_count;
        private Integer response_rate;
        private String response_time;
        private ZonedDateTime join_date;

        public Integer getTotal_products() { return total_products; }
        public void setTotal_products(Integer total_products) { this.total_products = total_products; }
        public Integer getTotal_orders() { return total_orders; }
        public void setTotal_orders(Integer total_orders) { this.total_orders = total_orders; }
        public Long getTotal_sales() { return total_sales; }
        public void setTotal_sales(Long total_sales) { this.total_sales = total_sales; }
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        public Integer getReviews_count() { return reviews_count; }
        public void setReviews_count(Integer reviews_count) { this.reviews_count = reviews_count; }
        public Integer getFollowers_count() { return followers_count; }
        public void setFollowers_count(Integer followers_count) { this.followers_count = followers_count; }
        public Integer getResponse_rate() { return response_rate; }
        public void setResponse_rate(Integer response_rate) { this.response_rate = response_rate; }
        public String getResponse_time() { return response_time; }
        public void setResponse_time(String response_time) { this.response_time = response_time; }
        public ZonedDateTime getJoin_date() { return join_date; }
        public void setJoin_date(ZonedDateTime join_date) { this.join_date = join_date; }
    }

    @Schema(description = "User preferences")
    public static class Preferences {
        private String language;
        private String currency;
        private String timezone;
        private Notifications notifications;
        private Privacy privacy;

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getTimezone() { return timezone; }
        public void setTimezone(String timezone) { this.timezone = timezone; }
        public Notifications getNotifications() { return notifications; }
        public void setNotifications(Notifications notifications) { this.notifications = notifications; }
        public Privacy getPrivacy() { return privacy; }
        public void setPrivacy(Privacy privacy) { this.privacy = privacy; }
    }

    @Schema(description = "Notification preferences")
    public static class Notifications {
        private Boolean push_enabled;
        private Boolean email_enabled;
        private Boolean sms_enabled;
        private Boolean order_updates;
        private Boolean messages;
        private Boolean promotions;
        private Boolean price_alerts;
        private Boolean new_followers;

        public Boolean getPush_enabled() { return push_enabled; }
        public void setPush_enabled(Boolean push_enabled) { this.push_enabled = push_enabled; }
        public Boolean getEmail_enabled() { return email_enabled; }
        public void setEmail_enabled(Boolean email_enabled) { this.email_enabled = email_enabled; }
        public Boolean getSms_enabled() { return sms_enabled; }
        public void setSms_enabled(Boolean sms_enabled) { this.sms_enabled = sms_enabled; }
        public Boolean getOrder_updates() { return order_updates; }
        public void setOrder_updates(Boolean order_updates) { this.order_updates = order_updates; }
        public Boolean getMessages() { return messages; }
        public void setMessages(Boolean messages) { this.messages = messages; }
        public Boolean getPromotions() { return promotions; }
        public void setPromotions(Boolean promotions) { this.promotions = promotions; }
        public Boolean getPrice_alerts() { return price_alerts; }
        public void setPrice_alerts(Boolean price_alerts) { this.price_alerts = price_alerts; }
        public Boolean getNew_followers() { return new_followers; }
        public void setNew_followers(Boolean new_followers) { this.new_followers = new_followers; }
    }

    @Schema(description = "Privacy settings")
    public static class Privacy {
        private Boolean show_phone;
        private Boolean show_email;
        private Boolean show_location;
        private String allow_messages;

        public Boolean getShow_phone() { return show_phone; }
        public void setShow_phone(Boolean show_phone) { this.show_phone = show_phone; }
        public Boolean getShow_email() { return show_email; }
        public void setShow_email(Boolean show_email) { this.show_email = show_email; }
        public Boolean getShow_location() { return show_location; }
        public void setShow_location(Boolean show_location) { this.show_location = show_location; }
        public String getAllow_messages() { return allow_messages; }
        public void setAllow_messages(String allow_messages) { this.allow_messages = allow_messages; }
    }

    @Schema(description = "Farm details (for producers only)")
    public static class FarmDetails {
        private String farm_name;
        private String farm_type;
        private Double farm_size;
        private String farm_size_unit;
        private Integer years_in_business;
        private String description;
        private List<String> specialization;
        private List<Certification> certifications;
        private Map<String, BusinessHours> business_hours;
        private List<FarmGalleryItem> farm_gallery;
        private DeliveryOptions delivery_options;

        public String getFarm_name() { return farm_name; }
        public void setFarm_name(String farm_name) { this.farm_name = farm_name; }
        public String getFarm_type() { return farm_type; }
        public void setFarm_type(String farm_type) { this.farm_type = farm_type; }
        public Double getFarm_size() { return farm_size; }
        public void setFarm_size(Double farm_size) { this.farm_size = farm_size; }
        public String getFarm_size_unit() { return farm_size_unit; }
        public void setFarm_size_unit(String farm_size_unit) { this.farm_size_unit = farm_size_unit; }
        public Integer getYears_in_business() { return years_in_business; }
        public void setYears_in_business(Integer years_in_business) { this.years_in_business = years_in_business; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getSpecialization() { return specialization; }
        public void setSpecialization(List<String> specialization) { this.specialization = specialization; }
        public List<Certification> getCertifications() { return certifications; }
        public void setCertifications(List<Certification> certifications) { this.certifications = certifications; }
        public Map<String, BusinessHours> getBusiness_hours() { return business_hours; }
        public void setBusiness_hours(Map<String, BusinessHours> business_hours) { this.business_hours = business_hours; }
        public List<FarmGalleryItem> getFarm_gallery() { return farm_gallery; }
        public void setFarm_gallery(List<FarmGalleryItem> farm_gallery) { this.farm_gallery = farm_gallery; }
        public DeliveryOptions getDelivery_options() { return delivery_options; }
        public void setDelivery_options(DeliveryOptions delivery_options) { this.delivery_options = delivery_options; }
    }

    @Schema(description = "Certification details")
    public static class Certification {
        private String certification_id;
        private String name;
        private String issuer;
        private String issue_date;
        private String expiry_date;
        private String certificate_number;
        private String document_url;
        private Boolean verified;

        public String getCertification_id() { return certification_id; }
        public void setCertification_id(String certification_id) { this.certification_id = certification_id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIssuer() { return issuer; }
        public void setIssuer(String issuer) { this.issuer = issuer; }
        public String getIssue_date() { return issue_date; }
        public void setIssue_date(String issue_date) { this.issue_date = issue_date; }
        public String getExpiry_date() { return expiry_date; }
        public void setExpiry_date(String expiry_date) { this.expiry_date = expiry_date; }
        public String getCertificate_number() { return certificate_number; }
        public void setCertificate_number(String certificate_number) { this.certificate_number = certificate_number; }
        public String getDocument_url() { return document_url; }
        public void setDocument_url(String document_url) { this.document_url = document_url; }
        public Boolean getVerified() { return verified; }
        public void setVerified(Boolean verified) { this.verified = verified; }
    }

    @Schema(description = "Business hours for a day")
    public static class BusinessHours {
        private String open;
        private String close;
        private Boolean is_open;

        public String getOpen() { return open; }
        public void setOpen(String open) { this.open = open; }
        public String getClose() { return close; }
        public void setClose(String close) { this.close = close; }
        public Boolean getIs_open() { return is_open; }
        public void setIs_open(Boolean is_open) { this.is_open = is_open; }
    }

    @Schema(description = "Farm gallery item")
    public static class FarmGalleryItem {
        private String image_id;
        private String url;
        private String thumbnail_url;
        private String caption;
        private ZonedDateTime uploaded_at;

        public String getImage_id() { return image_id; }
        public void setImage_id(String image_id) { this.image_id = image_id; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getThumbnail_url() { return thumbnail_url; }
        public void setThumbnail_url(String thumbnail_url) { this.thumbnail_url = thumbnail_url; }
        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }
        public ZonedDateTime getUploaded_at() { return uploaded_at; }
        public void setUploaded_at(ZonedDateTime uploaded_at) { this.uploaded_at = uploaded_at; }
    }

    @Schema(description = "Delivery options")
    public static class DeliveryOptions {
        private Boolean self_pickup;
        private Boolean home_delivery;
        private Integer delivery_radius;
        private Long delivery_fee;
        private Long free_delivery_threshold;

        public Boolean getSelf_pickup() { return self_pickup; }
        public void setSelf_pickup(Boolean self_pickup) { this.self_pickup = self_pickup; }
        public Boolean getHome_delivery() { return home_delivery; }
        public void setHome_delivery(Boolean home_delivery) { this.home_delivery = home_delivery; }
        public Integer getDelivery_radius() { return delivery_radius; }
        public void setDelivery_radius(Integer delivery_radius) { this.delivery_radius = delivery_radius; }
        public Long getDelivery_fee() { return delivery_fee; }
        public void setDelivery_fee(Long delivery_fee) { this.delivery_fee = delivery_fee; }
        public Long getFree_delivery_threshold() { return free_delivery_threshold; }
        public void setFree_delivery_threshold(Long free_delivery_threshold) { this.free_delivery_threshold = free_delivery_threshold; }
    }

    @Schema(description = "Payment information")
    public static class PaymentInfo {
        private Long wallet_balance;
        private Long pending_balance;
        private Boolean bank_account_linked;
        private String preferred_payment_method;

        public Long getWallet_balance() { return wallet_balance; }
        public void setWallet_balance(Long wallet_balance) { this.wallet_balance = wallet_balance; }
        public Long getPending_balance() { return pending_balance; }
        public void setPending_balance(Long pending_balance) { this.pending_balance = pending_balance; }
        public Boolean getBank_account_linked() { return bank_account_linked; }
        public void setBank_account_linked(Boolean bank_account_linked) { this.bank_account_linked = bank_account_linked; }
        public String getPreferred_payment_method() { return preferred_payment_method; }
        public void setPreferred_payment_method(String preferred_payment_method) { this.preferred_payment_method = preferred_payment_method; }
    }
}
