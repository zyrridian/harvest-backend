package com.zkylab.harvest.controller;

import com.zkylab.harvest.dto.*;
import com.zkylab.harvest.service.RegistrationService;
import com.zkylab.harvest.service.OtpService;
import com.zkylab.harvest.service.LoginService;
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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and Registration APIs")
public class AuthController {

    private final RegistrationService registrationService;
    private final OtpService otpService;
    private final LoginService loginService;

    public AuthController(RegistrationService registrationService, OtpService otpService, LoginService loginService) {
        this.registrationService = registrationService;
        this.otpService = otpService;
        this.loginService = loginService;
    }

    @PostMapping("/register")
    @Operation(
        summary = "Register new user account",
        description = "Register a new user with complete profile information including location and verification setup"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Registration successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RegisterResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                    {
                      "status": "success",
                      "message": "Registration successful. Please verify your phone number.",
                      "data": {
                        "user_id": "usr_1234567890abcdef",
                        "email": "john@example.com",
                        "phone": "+6281234567890",
                        "full_name": "John Doe",
                        "user_type": "producer",
                        "verification_required": true,
                        "verification_method": "otp",
                        "otp_sent_to": "+6281234567890",
                        "otp_expires_at": "2025-10-11T10:15:00Z",
                        "session_token": "temp_session_token_for_verification",
                        "created_at": "2025-10-11T10:10:00Z"
                      }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Validation error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    name = "Validation Error",
                    value = """
                    {
                      "status": "error",
                      "message": "Validation failed",
                      "errors": {
                        "email": ["Email is already registered"],
                        "password": ["Password must contain at least one uppercase letter"]
                      },
                      "error_code": "VALIDATION_ERROR"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Duplicate user",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    name = "Duplicate User",
                    value = """
                    {
                      "status": "error",
                      "message": "An account with this email or phone already exists",
                      "error_code": "DUPLICATE_USER",
                      "existing_fields": ["email"]
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Too many requests",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    name = "Rate Limit Exceeded",
                    value = """
                    {
                      "status": "error",
                      "message": "Too many registration attempts. Please try again in 15 minutes.",
                      "error_code": "RATE_LIMIT_EXCEEDED",
                      "retry_after": 900
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> registerUser(
            @Parameter(description = "Unique device identifier", example = "device-12345-xyz")
            @RequestHeader(value = "X-Device-ID", required = false) String deviceId,

            @Parameter(description = "Platform type", example = "android", schema = @Schema(allowableValues = {"android", "ios", "web"}))
            @RequestHeader(value = "X-Platform", required = false) String platform,

            @Parameter(description = "Application version", example = "1.0.0")
            @RequestHeader(value = "X-App-Version", required = false) String appVersion,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "User registration data",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = RegisterRequest.class),
                    examples = @ExampleObject(
                        name = "Producer Registration",
                        value = """
                        {
                          "user_type": "producer",
                          "full_name": "John Doe",
                          "email": "john.doe@example.com",
                          "phone": {
                            "country_code": "+62",
                            "number": "81234567890"
                          },
                          "password": "SecurePass123!",
                          "confirm_password": "SecurePass123!",
                          "location": {
                            "province": "West Java",
                            "province_id": 32,
                            "city": "Bandung",
                            "city_id": 3273,
                            "district": "Coblong",
                            "district_id": 327305,
                            "detailed_address": "Jl. Example No. 123",
                            "postal_code": "40132",
                            "latitude": -6.914744,
                            "longitude": 107.609810
                          },
                          "profile_picture": "https://example.com/profile.jpg",
                          "terms_accepted": true,
                          "marketing_consent": false,
                          "referral_code": "ABC123XYZ"
                        }
                        """
                    )
                )
            )
            @Valid @RequestBody RegisterRequest request) {
        Object result = registrationService.register(request);
        if (result instanceof RegisterResponse) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else if (result instanceof ErrorResponse) {
            ErrorResponse err = (ErrorResponse) result;
            if ("VALIDATION_ERROR".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            } else if ("DUPLICATE_USER".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            } else if ("RATE_LIMIT_EXCEEDED".equals(err.getError_code())) {
                return ResponseEntity.status(429).body(err);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unknown error");
    }

    @PostMapping("/verify-otp")
    @Operation(
        summary = "Verify OTP code",
        description = "Verify the OTP code sent to the user's phone number during registration"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "OTP verified successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = VerifyOtpResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                    {
                      "status": "success",
                      "message": "Phone number verified successfully",
                      "data": {
                        "user_id": "usr_1234567890abcdef",
                        "verified": true,
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "Bearer",
                        "expires_in": 3600,
                        "user": {
                          "user_id": "usr_1234567890abcdef",
                          "email": "john@example.com",
                          "phone": "+6281234567890",
                          "full_name": "John Doe",
                          "user_type": "producer",
                          "is_verified": true,
                          "is_profile_complete": false,
                          "verification_status": {
                            "email_verified": false,
                            "phone_verified": true,
                            "business_verified": false
                          }
                        }
                      }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid OTP",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OtpErrorResponse.class),
                examples = @ExampleObject(
                    name = "Invalid OTP",
                    value = """
                    {
                      "status": "error",
                      "message": "Invalid or expired OTP code",
                      "error_code": "INVALID_OTP",
                      "attempts_remaining": 2,
                      "max_attempts": 5
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Max attempts exceeded",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OtpErrorResponse.class),
                examples = @ExampleObject(
                    name = "Max Attempts Exceeded",
                    value = """
                    {
                      "status": "error",
                      "message": "Maximum OTP attempts exceeded. Please request a new code.",
                      "error_code": "MAX_ATTEMPTS_EXCEEDED",
                      "can_resend_at": "2025-10-11T10:20:00Z"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "410",
            description = "OTP expired",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OtpErrorResponse.class),
                examples = @ExampleObject(
                    name = "OTP Expired",
                    value = """
                    {
                      "status": "error",
                      "message": "OTP code has expired. Please request a new one.",
                      "error_code": "OTP_EXPIRED"
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> verifyOtp(
            @Parameter(description = "Temporary session token from registration", example = "temp_ver_1234567890abcdef")
            @RequestHeader(value = "Authorization", required = false) String authorization,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "OTP verification data",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VerifyOtpRequest.class),
                    examples = @ExampleObject(
                        name = "Verify OTP",
                        value = """
                        {
                          "otp_code": "123456",
                          "verification_id": "ver_1234567890abcdef"
                        }
                        """
                    )
                )
            )
            @Valid @RequestBody VerifyOtpRequest request) {
        Object result = otpService.verifyOtp(request);

        if (result instanceof VerifyOtpResponse) {
            return ResponseEntity.ok(result);
        } else if (result instanceof OtpErrorResponse) {
            OtpErrorResponse err = (OtpErrorResponse) result;
            if ("INVALID_OTP".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            } else if ("MAX_ATTEMPTS_EXCEEDED".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            } else if ("OTP_EXPIRED".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.GONE).body(err);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unknown error");
    }

    @PostMapping("/resend-otp")
    @Operation(
        summary = "Resend OTP code",
        description = "Request a new OTP code to be sent via SMS, WhatsApp, or phone call"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "OTP resent successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ResendOtpResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                    {
                      "status": "success",
                      "message": "OTP code has been resent",
                      "data": {
                        "verification_id": "ver_1234567890abcdef",
                        "sent_to": "+6281234567890",
                        "method": "sms",
                        "expires_at": "2025-10-11T10:25:00Z",
                        "can_resend_at": "2025-10-11T10:21:00Z"
                      }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Resend cooldown",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = OtpErrorResponse.class),
                examples = @ExampleObject(
                    name = "Resend Cooldown",
                    value = """
                    {
                      "status": "error",
                      "message": "Please wait before requesting another OTP",
                      "error_code": "RESEND_COOLDOWN",
                      "retry_after": 45
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> resendOtp(
            @Parameter(description = "Temporary session token from registration", example = "temp_ver_1234567890abcdef")
            @RequestHeader(value = "Authorization", required = false) String authorization,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Resend OTP request data",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ResendOtpRequest.class),
                    examples = @ExampleObject(
                        name = "Resend OTP",
                        value = """
                        {
                          "verification_id": "ver_1234567890abcdef",
                          "method": "sms"
                        }
                        """
                    )
                )
            )
            @Valid @RequestBody ResendOtpRequest request) {
        Object result = otpService.resendOtp(request);

        if (result instanceof ResendOtpResponse) {
            return ResponseEntity.ok(result);
        } else if (result instanceof OtpErrorResponse) {
            OtpErrorResponse err = (OtpErrorResponse) result;
            if ("RESEND_COOLDOWN".equals(err.getError_code())) {
                return ResponseEntity.status(429).body(err);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unknown error");
    }

    @PostMapping("/login")
    @Operation(
        summary = "User login",
        description = "Authenticate user with email/phone and password, returns JWT tokens"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                    {
                      "status": "success",
                      "message": "Login successful",
                      "data": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "Bearer",
                        "expires_in": 3600,
                        "user": {
                          "user_id": "usr_1234567890abcdef",
                          "email": "john@example.com",
                          "phone": "+6281234567890",
                          "full_name": "John Doe",
                          "user_type": "producer",
                          "profile_picture": "https://cdn.farmmarket.com/profiles/usr_123.jpg",
                          "is_verified": true,
                          "is_profile_complete": true,
                          "verification_status": {
                            "email_verified": true,
                            "phone_verified": true,
                            "business_verified": true,
                            "business_verified_at": "2025-09-15T08:30:00Z"
                          },
                          "preferences": {
                            "language": "en",
                            "currency": "IDR",
                            "notifications_enabled": true,
                            "theme": "light"
                          },
                          "stats": {
                            "total_orders": 45,
                            "total_spent": 1250000,
                            "total_sales": 5000000,
                            "rating": 4.8,
                            "reviews_count": 23
                          }
                        },
                        "permissions": [
                          "create_product",
                          "manage_orders",
                          "view_analytics",
                          "chat_with_users"
                        ]
                      }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid credentials",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginErrorResponse.class),
                examples = @ExampleObject(
                    name = "Invalid Credentials",
                    value = """
                    {
                      "status": "error",
                      "message": "Invalid email/phone or password",
                      "error_code": "INVALID_CREDENTIALS",
                      "attempts_remaining": 4
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Account locked or suspended",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginErrorResponse.class),
                examples = {
                    @ExampleObject(
                        name = "Account Locked",
                        value = """
                        {
                          "status": "error",
                          "message": "Your account has been temporarily locked due to multiple failed login attempts",
                          "error_code": "ACCOUNT_LOCKED",
                          "locked_until": "2025-10-09T11:00:00Z",
                          "contact_support": true
                        }
                        """
                    ),
                    @ExampleObject(
                        name = "Account Suspended",
                        value = """
                        {
                          "status": "error",
                          "message": "Your account has been suspended. Please contact support.",
                          "error_code": "ACCOUNT_SUSPENDED",
                          "reason": "Terms violation",
                          "support_email": "support@farmmarket.com"
                        }
                        """
                    )
                }
            )
        ),
        @ApiResponse(
            responseCode = "428",
            description = "Email not verified",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginErrorResponse.class),
                examples = @ExampleObject(
                    name = "Email Not Verified",
                    value = """
                    {
                      "status": "error",
                      "message": "Please verify your email address to continue",
                      "error_code": "EMAIL_NOT_VERIFIED",
                      "data": {
                        "user_id": "usr_1234567890abcdef",
                        "email": "john@example.com",
                        "can_resend_verification": true
                      }
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<?> login(
            @Parameter(description = "Unique device identifier", example = "device-12345-xyz")
            @RequestHeader(value = "X-Device-ID", required = false) String deviceId,

            @Parameter(description = "Platform type", example = "android", schema = @Schema(allowableValues = {"android", "ios", "web"}))
            @RequestHeader(value = "X-Platform", required = false) String platform,

            @Parameter(description = "Application version", example = "1.0.0")
            @RequestHeader(value = "X-App-Version", required = false) String appVersion,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Login credentials",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = LoginRequest.class),
                    examples = @ExampleObject(
                        name = "Login with Email",
                        value = """
                        {
                          "identifier": "john@example.com",
                          "password": "SecurePass123!",
                          "remember_me": true,
                          "device_info": {
                            "device_name": "Samsung Galaxy S21",
                            "os_version": "Android 12",
                            "fcm_token": "fcm_device_token_for_notifications"
                          }
                        }
                        """
                    )
                )
            )
            @Valid @RequestBody LoginRequest request) {
        Object result = loginService.login(request);

        if (result instanceof LoginResponse) {
            return ResponseEntity.ok(result);
        } else if (result instanceof LoginErrorResponse) {
            LoginErrorResponse err = (LoginErrorResponse) result;
            if ("INVALID_CREDENTIALS".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            } else if ("ACCOUNT_LOCKED".equals(err.getError_code()) || "ACCOUNT_SUSPENDED".equals(err.getError_code())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            } else if ("EMAIL_NOT_VERIFIED".equals(err.getError_code())) {
                return ResponseEntity.status(428).body(err);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unknown error");
    }
}

