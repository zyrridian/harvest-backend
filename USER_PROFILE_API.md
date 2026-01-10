# User Profile API Testing Guide

## Overview

The User Profile endpoints allow authenticated users to view and update their profile information.

## Endpoints Implemented

### 1. GET `/api/v1/users/profile`

Get the current user's profile information.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_xxx",
      "email": "user@example.com",
      "name": "John Doe",
      "phone_number": "+6281234567890",
      "avatar_url": "https://...",
      "user_type": "CONSUMER",
      "is_verified": false,
      "created_at": "2026-01-10T...",
      "updated_at": "2026-01-10T..."
    },
    "profile": {
      "bio": "My bio text",
      "followers_count": 0,
      "response_rate": 0,
      "response_time": null,
      "joined_since": "2026-01-10T..."
    }
  }
}
```

### 2. PUT `/api/v1/users/profile`

Update the current user's profile information.

**Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "phone_number": "+6281234567890",
  "bio": "Updated bio text"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": { ... },
    "profile": { ... }
  }
}
```

### 3. PUT `/api/v1/users/avatar`

Upload and update the user's avatar image.

**Headers:**

```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `avatar`: Image file (JPEG, PNG, WebP)
- Max size: 5MB

**Response (200):**

```json
{
  "status": "success",
  "message": "Avatar updated successfully",
  "data": {
    "avatar_url": "https://cdn.farmmarket.com/avatars/..."
  }
}
```

## Testing with Swagger

1. Open http://localhost:3000/docs
2. First, register or login to get an access token
3. Click "Authorize" button and enter: `Bearer {your_access_token}`
4. Navigate to the "User Profile" section
5. Try the endpoints

## Testing with cURL

### Get Profile

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "phone_number": "+6281234567890",
    "bio": "My new bio"
  }'
```

### Update Avatar

```bash
curl -X PUT http://localhost:3000/api/v1/users/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

## Database Schema

The `user_profiles` table stores extended profile information:

```sql
CREATE TABLE user_profiles (
  user_id VARCHAR(255) PRIMARY KEY,
  bio TEXT,
  followers_count INT DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  response_time VARCHAR(50),
  joined_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Notes

- The `avatar` endpoint currently returns a placeholder URL
- In production, integrate with cloud storage (AWS S3, Cloudinary, etc.)
- Profile is auto-created when updating bio for the first time
- All fields in the update endpoint are optional
