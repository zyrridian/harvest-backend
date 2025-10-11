package com.zkylab.harvest.controller;

import com.zkylab.harvest.dto.RegisterRequest;
import com.zkylab.harvest.dto.RegisterResponse;
import com.zkylab.harvest.dto.ErrorResponse;
import com.zkylab.harvest.service.RegistrationService;
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

    public AuthController(RegistrationService registrationService) {
        this.registrationService = registrationService;
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
}
