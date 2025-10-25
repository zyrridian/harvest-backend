package com.zkylab.harvest.service;

import com.zkylab.harvest.dto.UserProfileResponse;
import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.*;

/**
 * UserService - Handles user profile operations
 * 
 * This service manages user profile retrieval and updates.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get current user profile
     * 
     * @param userId The authenticated user's ID
     * @return UserProfileResponse with complete profile data
     */
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            UserProfileResponse response = new UserProfileResponse();
            response.setStatus("error");
            return response;
        }

        User user = userOpt.get();

        UserProfileResponse response = new UserProfileResponse();
        response.setStatus("success");

        UserProfileResponse.UserProfileData data = new UserProfileResponse.UserProfileData();
        data.setUser_id("usr_" + user.getId());
        data.setEmail(user.getEmail());
        data.setPhone(user.getPhoneNumber());
        data.setFull_name(user.getFullName());
        data.setUser_type(user.getUserType());
        data.setProfile_picture(user.getProfilePicture());
        
        // Mock data for fields not yet in User entity
        data.setCover_photo("https://cdn.farmmarket.com/covers/usr_" + user.getId() + ".jpg");
        data.setBio("Bio coming soon");

        // Location
        UserProfileResponse.Location location = new UserProfileResponse.Location();
        location.setProvince(user.getProvince());
        location.setProvince_id(null); // Mock - IDs not yet in User entity
        location.setCity(user.getCity());
        location.setCity_id(null); // Mock - IDs not yet in User entity
        location.setDistrict(user.getDistrict());
        location.setDetailed_address(user.getDetailedAddress());
        location.setLatitude(user.getLatitude());
        location.setLongitude(user.getLongitude());
        data.setLocation(location);

        // Verification Status
        UserProfileResponse.VerificationStatus verificationStatus = new UserProfileResponse.VerificationStatus();
        verificationStatus.setEmail_verified(user.getIsEmailVerified());
        verificationStatus.setPhone_verified(user.getIsPhoneVerified());
        verificationStatus.setBusiness_verified(false); // Mock
        verificationStatus.setVerified_badge(false); // Mock
        verificationStatus.setVerified_at(null);
        data.setVerification_status(verificationStatus);

        // Stats (mock data)
        UserProfileResponse.Stats stats = new UserProfileResponse.Stats();
        stats.setTotal_products(0);
        stats.setTotal_orders(0);
        stats.setTotal_sales(0L);
        stats.setRating(0.0);
        stats.setReviews_count(0);
        stats.setFollowers_count(0);
        stats.setResponse_rate(0);
        stats.setResponse_time("N/A");
        stats.setJoin_date(ZonedDateTime.now()); // Mock
        data.setStats(stats);

        // Preferences (mock data)
        UserProfileResponse.Preferences preferences = new UserProfileResponse.Preferences();
        preferences.setLanguage("en");
        preferences.setCurrency("IDR");
        preferences.setTimezone("Asia/Jakarta");
        
        UserProfileResponse.Notifications notifications = new UserProfileResponse.Notifications();
        notifications.setPush_enabled(true);
        notifications.setEmail_enabled(true);
        notifications.setSms_enabled(false);
        notifications.setOrder_updates(true);
        notifications.setMessages(true);
        notifications.setPromotions(false);
        notifications.setPrice_alerts(true);
        notifications.setNew_followers(true);
        preferences.setNotifications(notifications);

        UserProfileResponse.Privacy privacy = new UserProfileResponse.Privacy();
        privacy.setShow_phone(true);
        privacy.setShow_email(false);
        privacy.setShow_location(true);
        privacy.setAllow_messages("everyone");
        preferences.setPrivacy(privacy);
        
        data.setPreferences(preferences);

        // Farm Details (if producer)
        if ("producer".equalsIgnoreCase(user.getUserType())) {
            UserProfileResponse.FarmDetails farmDetails = new UserProfileResponse.FarmDetails();
            farmDetails.setFarm_name("Green Valley Farm");
            farmDetails.setFarm_type("crop_farm");
            farmDetails.setFarm_size(5.5);
            farmDetails.setFarm_size_unit("hectares");
            farmDetails.setYears_in_business(10);
            farmDetails.setDescription("We practice organic farming methods...");
            farmDetails.setSpecialization(Arrays.asList("vegetables", "fruits"));
            farmDetails.setCertifications(new ArrayList<>());
            
            // Business hours
            Map<String, UserProfileResponse.BusinessHours> businessHours = new HashMap<>();
            String[] weekdays = {"monday", "tuesday", "wednesday", "thursday", "friday"};
            for (String day : weekdays) {
                UserProfileResponse.BusinessHours hours = new UserProfileResponse.BusinessHours();
                hours.setOpen("08:00");
                hours.setClose("17:00");
                hours.setIs_open(true);
                businessHours.put(day, hours);
            }
            UserProfileResponse.BusinessHours saturday = new UserProfileResponse.BusinessHours();
            saturday.setOpen("08:00");
            saturday.setClose("14:00");
            saturday.setIs_open(true);
            businessHours.put("saturday", saturday);
            
            UserProfileResponse.BusinessHours sunday = new UserProfileResponse.BusinessHours();
            sunday.setOpen(null);
            sunday.setClose(null);
            sunday.setIs_open(false);
            businessHours.put("sunday", sunday);
            
            farmDetails.setBusiness_hours(businessHours);
            farmDetails.setFarm_gallery(new ArrayList<>());
            
            UserProfileResponse.DeliveryOptions deliveryOptions = new UserProfileResponse.DeliveryOptions();
            deliveryOptions.setSelf_pickup(true);
            deliveryOptions.setHome_delivery(true);
            deliveryOptions.setDelivery_radius(50);
            deliveryOptions.setDelivery_fee(15000L);
            deliveryOptions.setFree_delivery_threshold(100000L);
            farmDetails.setDelivery_options(deliveryOptions);
            
            data.setFarm_details(farmDetails);
        }

        // Payment Info (mock data)
        UserProfileResponse.PaymentInfo paymentInfo = new UserProfileResponse.PaymentInfo();
        paymentInfo.setWallet_balance(0L);
        paymentInfo.setPending_balance(0L);
        paymentInfo.setBank_account_linked(false);
        paymentInfo.setPreferred_payment_method("bank_transfer");
        data.setPayment_info(paymentInfo);

        // Timestamps
        data.setCreated_at(user.getCreatedAt() != null ? user.getCreatedAt() : ZonedDateTime.now());
        data.setUpdated_at(ZonedDateTime.now()); // Mock - no updatedAt field in User yet
        data.setLast_active_at(user.getLastLoginAt() != null ? user.getLastLoginAt() : ZonedDateTime.now());

        response.setData(data);
        return response;
    }
}
