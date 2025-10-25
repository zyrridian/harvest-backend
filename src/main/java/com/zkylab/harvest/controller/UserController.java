package com.zkylab.harvest.controller;

import com.zkylab.harvest.dto.UserProfileResponse;
import com.zkylab.harvest.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile", description = "User profile management APIs")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current user profile",
        description = "Retrieve the complete profile of the authenticated user including verification status, stats, preferences, and farm details (for producers)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profile retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserProfileResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                    {
                      "status": "success",
                      "data": {
                        "user_id": "usr_1234567890abcdef",
                        "email": "john@example.com",
                        "phone": "+6281234567890",
                        "full_name": "John Doe",
                        "user_type": "producer",
                        "profile_picture": "https://cdn.farmmarket.com/profiles/usr_123.jpg",
                        "cover_photo": "https://cdn.farmmarket.com/covers/usr_123.jpg",
                        "bio": "Organic farmer specializing in vegetables",
                        "location": {
                          "province": "West Java",
                          "province_id": 32,
                          "city": "Bandung",
                          "city_id": 3273,
                          "district": "Coblong",
                          "detailed_address": "Jl. Example No. 123",
                          "latitude": -6.914744,
                          "longitude": 107.609810
                        },
                        "verification_status": {
                          "email_verified": true,
                          "phone_verified": true,
                          "business_verified": true,
                          "verified_badge": true,
                          "verified_at": "2025-09-15T08:30:00Z"
                        },
                        "stats": {
                          "total_products": 25,
                          "total_orders": 145,
                          "total_sales": 25000000,
                          "rating": 4.8,
                          "reviews_count": 78,
                          "followers_count": 234,
                          "response_rate": 95,
                          "response_time": "< 1 hour",
                          "join_date": "2024-05-10T10:00:00Z"
                        },
                        "preferences": {
                          "language": "en",
                          "currency": "IDR",
                          "timezone": "Asia/Jakarta",
                          "notifications": {
                            "push_enabled": true,
                            "email_enabled": true,
                            "sms_enabled": false,
                            "order_updates": true,
                            "messages": true,
                            "promotions": false,
                            "price_alerts": true,
                            "new_followers": true
                          },
                          "privacy": {
                            "show_phone": true,
                            "show_email": false,
                            "show_location": true,
                            "allow_messages": "everyone"
                          }
                        },
                        "farm_details": {
                          "farm_name": "Green Valley Farm",
                          "farm_type": "crop_farm",
                          "farm_size": 5.5,
                          "farm_size_unit": "hectares",
                          "years_in_business": 10,
                          "description": "We practice organic farming methods...",
                          "specialization": ["vegetables", "fruits"],
                          "certifications": [
                            {
                              "certification_id": "cert_123",
                              "name": "Organic Certification",
                              "issuer": "Organic Indonesia",
                              "issue_date": "2024-01-15",
                              "expiry_date": "2026-01-15",
                              "certificate_number": "ORG-2024-001",
                              "document_url": "https://cdn.farmmarket.com/certs/cert_123.pdf",
                              "verified": true
                            }
                          ],
                          "business_hours": {
                            "monday": {"open": "08:00", "close": "17:00", "is_open": true},
                            "tuesday": {"open": "08:00", "close": "17:00", "is_open": true},
                            "wednesday": {"open": "08:00", "close": "17:00", "is_open": true},
                            "thursday": {"open": "08:00", "close": "17:00", "is_open": true},
                            "friday": {"open": "08:00", "close": "17:00", "is_open": true},
                            "saturday": {"open": "08:00", "close": "14:00", "is_open": true},
                            "sunday": {"open": null, "close": null, "is_open": false}
                          },
                          "farm_gallery": [
                            {
                              "image_id": "img_123",
                              "url": "https://cdn.farmmarket.com/farms/img_123.jpg",
                              "thumbnail_url": "https://cdn.farmmarket.com/farms/thumb_img_123.jpg",
                              "caption": "Our vegetable field",
                              "uploaded_at": "2024-06-10T12:00:00Z"
                            }
                          ],
                          "delivery_options": {
                            "self_pickup": true,
                            "home_delivery": true,
                            "delivery_radius": 50,
                            "delivery_fee": 15000,
                            "free_delivery_threshold": 100000
                          }
                        },
                        "payment_info": {
                          "wallet_balance": 500000,
                          "pending_balance": 150000,
                          "bank_account_linked": true,
                          "preferred_payment_method": "bank_transfer"
                        },
                        "created_at": "2024-05-10T10:00:00Z",
                        "updated_at": "2025-10-08T15:30:00Z",
                        "last_active_at": "2025-10-09T09:45:00Z"
                      }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - invalid or missing token",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "Unauthorized",
                    value = """
                    {
                      "status": "error",
                      "message": "Authentication required"
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> getCurrentUserProfile(
            @Parameter(description = "Bearer token", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        
        // TODO: Extract user ID from JWT token in Authorization header
        // For now, using a placeholder
        Long userId = 1L; // This should be extracted from the JWT token

        UserProfileResponse response = userService.getCurrentUserProfile(userId);

        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
