# API Usage Examples

## Authentication Examples

### Register as a Consumer (Default)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com",
    "password": "password123",
    "name": "John Consumer",
    "phone_number": "+6281234567890"
  }'
```

Or explicitly set user_type:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com",
    "password": "password123",
    "name": "John Consumer",
    "phone_number": "+6281234567890",
    "user_type": "CONSUMER"
  }'
```

### Register as a Producer (Farmer/Seller)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123",
    "name": "Jane Farmer",
    "phone_number": "+6281234567891",
    "user_type": "PRODUCER"
  }'
```

### Register as an Admin

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "phone_number": "+6281234567892",
    "user_type": "ADMIN"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com",
    "password": "password123"
  }'
```

### Response Format

All registration and login requests return the same format:

```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "consumer@example.com",
      "name": "John Consumer",
      "phone_number": "+6281234567890",
      "avatar_url": null,
      "user_type": "CONSUMER",
      "is_verified": false,
      "created_at": "2026-02-02T10:30:00.000Z",
      "updated_at": "2026-02-02T10:30:00.000Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

## User Types

### CONSUMER

- Can browse and search products
- Can add items to cart and place orders
- Can leave reviews and ratings
- Can message farmers
- Can join community discussions

### PRODUCER

- All CONSUMER features
- Can create and manage product listings
- Can manage farmer profile
- Can fulfill orders
- Can respond to customer messages

### ADMIN

- Full system access
- Can manage all users
- Can manage all products
- Can view all orders
- Can moderate community content
- Can access admin dashboard

## Using the Access Token

After login/registration, use the access token in subsequent API calls:

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Swagger Documentation

Access the interactive API documentation at:

- Development: http://localhost:3000/docs
- Production: https://harvest-backend-ugjh.vercel.app/docs

The Swagger UI allows you to:

1. View all available endpoints
2. Test API calls directly from the browser
3. See request/response schemas
4. Select user type when registering
