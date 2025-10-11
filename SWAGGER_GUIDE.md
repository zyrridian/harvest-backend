# Swagger UI Testing Guide

## Accessing Swagger UI

Once the application is running, you can access Swagger UI at:

**http://localhost:8080/swagger-ui.html**

## Quick Start

1. **Start the application**:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:8080/swagger-ui.html
   ```

3. **Find the Registration Endpoint**:
   - Look for the "Authentication" section
   - Click on "POST /api/auth/register"
   - Click "Try it out"

4. **Test with Pre-filled Data**:
   - The request body is already pre-filled with example data:
     - User Type: producer
     - Full Name: John Doe
     - Email: john.doe@example.com
     - Phone: +62 81234567890
     - Password: SecurePass123!
     - Location: Bandung, West Java
     - And all other required fields
   
5. **Optional Headers** (can be added in the header section):
   - X-Device-ID: device-12345-xyz
   - X-Platform: android
   - X-App-Version: 1.0.0

6. **Execute**:
   - Click the blue "Execute" button
   - View the response below with status code and JSON response

## Testing Different Scenarios

### Successful Registration (201)
Use the default example data as-is.

### Validation Error (400)
Modify the example to trigger validation errors:
- Change email to invalid format: "notanemail"
- Change password to weak: "password"
- Set terms_accepted to false

### Duplicate User (409)
Register the same email/phone twice to see duplicate error.

### Testing Password Validation
Try these passwords to see validation:
- "password" - Missing uppercase, number, special char
- "PASSWORD123" - Missing lowercase and special char
- "Password123" - Missing special char
- "Password123!" - ✅ Valid

## API Documentation Features

The Swagger UI provides:
- ✅ Pre-filled request examples
- ✅ All possible response codes (201, 400, 409, 429)
- ✅ Response schema documentation
- ✅ Field validation rules
- ✅ Example values for all fields
- ✅ Interactive testing interface

## Alternative API Docs

You can also view the raw OpenAPI specification at:
**http://localhost:8080/v3/api-docs**

Or the YAML version at:
**http://localhost:8080/v3/api-docs.yaml**

