# Registration Endpoint Documentation

## Endpoint: POST /api/auth/register

### Description
Register a new user account with full validation and error handling.

### Request Headers
- `Content-Type`: application/json (required)
- `X-Device-ID`: unique-device-identifier (optional)
- `X-Platform`: android|ios|web (optional)
- `X-App-Version`: 1.0.0 (optional)

### Request Body Example
```json
{
  "user_type": "producer",
  "full_name": "John Doe",
  "email": "john@example.com",
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
  "profile_picture": "base64_encoded_image_or_url",
  "terms_accepted": true,
  "marketing_consent": false,
  "referral_code": "ABC123XYZ"
}
```

### Validation Rules
- **user_type**: Required, must be "producer", "buyer", or "both"
- **full_name**: Required, 3-100 characters, letters and spaces only
- **email**: Required, valid email format, unique in database
- **phone.number**: Required, 9-15 digits, unique in database
- **password**: Required, min 8 chars, must contain uppercase, lowercase, number, and special character
- **confirm_password**: Required, must match password
- **terms_accepted**: Required, must be true
- **latitude**: Required, between -90 and 90
- **longitude**: Required, between -180 and 180

### Success Response (201 Created)
```json
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
    "otp_expires_at": "2025-10-09T10:15:00Z",
    "session_token": "temp_session_token_for_verification",
    "created_at": "2025-10-09T10:10:00Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": ["Email is already registered"],
    "phone": ["Phone number is already in use"],
    "password": ["Password must contain at least one uppercase letter"]
  },
  "error_code": "VALIDATION_ERROR"
}
```

#### 409 Conflict - Duplicate User
```json
{
  "status": "error",
  "message": "An account with this email or phone already exists",
  "error_code": "DUPLICATE_USER",
  "existing_fields": ["email"]
}
```

#### 429 Too Many Requests
```json
{
  "status": "error",
  "message": "Too many registration attempts. Please try again in 15 minutes.",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 900
}
```

## Implementation Structure

### DTOs
- **RegisterRequest**: Request DTO with nested Phone and Location classes
- **RegisterResponse**: Success response DTO with user data
- **ErrorResponse**: Error response DTO for all error types

### Service Layer
- **RegistrationService**: Handles registration logic, validation, and user creation

### Controller
- **AuthController**: Exposes the /api/auth/register endpoint

### Exception Handling
- **GlobalExceptionHandler**: Catches validation exceptions and formats them properly

### Entity
- **User**: JPA entity with all required fields (temporary structure until final table design)

### Repository
- **UserRepository**: JPA repository with methods for email and phone uniqueness checks

## Testing the Endpoint

Use curl or Postman to test:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device123" \
  -H "X-Platform: web" \
  -H "X-App-Version: 1.0.0" \
  -d '{
    "user_type": "producer",
    "full_name": "John Doe",
    "email": "john@example.com",
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
    "terms_accepted": true,
    "marketing_consent": false
  }'
```

## Notes
- The User entity is currently a temporary structure. Update it when you finalize the database schema.
- Rate limiting is not yet implemented in the service (marked as TODO).
- OTP sending is simulated - integrate with actual SMS service provider.
- Profile picture validation (max 5MB, file types) should be added based on your upload strategy.

