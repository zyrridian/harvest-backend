# Admin Panel API Documentation

This document provides comprehensive information about the Admin Panel API endpoints for the Harvest Backend. All admin endpoints require authentication with an ADMIN role.

## Authentication

All admin endpoints require:

- **Header**: `Authorization: Bearer {access_token}`
- **User Role**: `ADMIN`

If the user is not authenticated or doesn't have admin role, endpoints will return:

- **401 Unauthorized**: No token provided or invalid token
- **403 Forbidden**: User is not an admin

---

## Table of Contents

1. [Dashboard & Analytics](#dashboard--analytics)
2. [User Management](#user-management)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Farmer Management](#farmer-management)
6. [Community Moderation](#community-moderation)

---

## Dashboard & Analytics

### GET /api/v1/admin/dashboard

Get comprehensive dashboard statistics including users, products, orders, revenue, and more.

**Authentication:** Required (Admin only)

**Response:**

```json
{
  "status": "success",
  "data": {
    "overview": {
      "users": {
        "total": 1250,
        "new_today": 15,
        "new_this_month": 234,
        "growth_percentage": 12.5
      },
      "products": {
        "total": 450,
        "active": 420,
        "inactive": 30
      },
      "orders": {
        "total": 3200,
        "today": 45,
        "this_month": 890,
        "pending": 12
      },
      "revenue": {
        "total": 125000000,
        "this_month": 25000000,
        "last_month": 22000000,
        "growth_percentage": 13.64
      },
      "farmers": {
        "total": 120,
        "verified": 95,
        "unverified": 25
      },
      "community": {
        "posts": 340,
        "reviews": 2100
      },
      "notifications": {
        "unread": 567
      }
    },
    "recent_orders": [
      {
        "id": "ord_123",
        "order_number": "ORD-2026-001",
        "buyer": {
          "id": "usr_456",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "seller": {
          "id": "usr_789",
          "name": "Organic Farm"
        },
        "total_amount": 150000,
        "status": "PENDING_PAYMENT",
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "top_products": [
      {
        "id": "prd_123",
        "name": "Organic Tomatoes",
        "price": 25000,
        "review_count": 45,
        "rating": 4.8,
        "seller": {
          "id": "usr_789",
          "name": "Organic Farm"
        }
      }
    ],
    "orders_by_status": {
      "PENDING_PAYMENT": 12,
      "PAID": 8,
      "PROCESSING": 15,
      "SHIPPED": 20,
      "DELIVERED": 150,
      "CANCELLED": 5,
      "REFUNDED": 2
    }
  }
}
```

---

## User Management

### GET /api/v1/admin/users

Get all users with filtering and pagination.

**Authentication:** Required (Admin only)

**Query Parameters:**

- `search` (string): Search by name or email
- `user_type` (string): Filter by user type - `CONSUMER`, `PRODUCER`, `ADMIN`
- `is_verified` (boolean): Filter by verification status
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "usr_123",
        "email": "user@example.com",
        "name": "John Doe",
        "phone_number": "+6281234567890",
        "avatar_url": "https://...",
        "user_type": "CONSUMER",
        "is_verified": true,
        "is_online": false,
        "last_seen": "2026-01-10T09:30:00Z",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-10T10:00:00Z",
        "_count": {
          "buyer_orders": 15,
          "seller_orders": 0,
          "products": 0,
          "reviews": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1250,
      "total_pages": 63
    }
  }
}
```

### GET /api/v1/admin/users/:id

Get detailed information about a specific user.

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): User ID

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone_number": "+6281234567890",
    "avatar_url": "https://...",
    "user_type": "CONSUMER",
    "is_verified": true,
    "is_online": false,
    "last_seen": "2026-01-10T09:30:00Z",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-10T10:00:00Z",
    "profile": {
      "user_id": "usr_123",
      "bio": "Love organic produce!",
      "followers_count": 25,
      "response_rate": 95.5,
      "response_time": "< 1 hour",
      "joined_since": "2026-01-01T00:00:00Z"
    },
    "farmer": null,
    "_count": {
      "buyer_orders": 15,
      "seller_orders": 0,
      "products": 0,
      "reviews": 8,
      "community_posts": 3,
      "favorites": 12
    }
  }
}
```

### PUT /api/v1/admin/users/:id

Update user information.

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): User ID

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "user_type": "PRODUCER",
  "is_verified": true
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "id": "usr_123",
    "email": "newemail@example.com",
    "name": "John Doe Updated",
    "user_type": "PRODUCER",
    "is_verified": true,
    "...": "..."
  }
}
```

### DELETE /api/v1/admin/users/:id

Delete a user account.

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): User ID

**Response:**

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## Product Management

### GET /api/v1/admin/products

Get all products with filtering.

**Authentication:** Required (Admin only)

**Query Parameters:**

- `search` (string): Search by name or description
- `is_available` (boolean): Filter by availability
- `category_id` (string): Filter by category
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "prd_123",
        "name": "Organic Tomatoes",
        "description": "Fresh organic tomatoes",
        "price": 25000,
        "stock_quantity": 100,
        "is_available": true,
        "seller": {
          "id": "usr_789",
          "name": "Organic Farm",
          "email": "farm@example.com"
        },
        "category": {
          "id": "cat_001",
          "name": "Vegetables"
        },
        "_count": {
          "reviews": 45,
          "favorites": 120
        },
        "created_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 450,
      "total_pages": 23
    }
  }
}
```

### PUT /api/v1/admin/products/:id

Update product information (e.g., availability, stock).

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): Product ID

**Request Body:**

```json
{
  "is_available": false,
  "stock_quantity": 0
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "id": "prd_123",
    "is_available": false,
    "stock_quantity": 0,
    "...": "..."
  }
}
```

### DELETE /api/v1/admin/products/:id

Delete a product.

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): Product ID

**Response:**

```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

---

## Order Management

### GET /api/v1/admin/orders

Get all orders with filtering.

**Authentication:** Required (Admin only)

**Query Parameters:**

- `status` (string): Filter by status - `PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `search` (string): Search by order number
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "ord_123",
        "order_number": "ORD-2026-001",
        "buyer": {
          "id": "usr_456",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "seller": {
          "id": "usr_789",
          "name": "Organic Farm"
        },
        "status": "PROCESSING",
        "subtotal": 150000,
        "delivery_fee": 10000,
        "total_amount": 160000,
        "payment_method": "bank_transfer",
        "items": [
          {
            "id": "item_001",
            "product": {
              "id": "prd_123",
              "name": "Organic Tomatoes"
            },
            "quantity": 5,
            "unit_price": 25000,
            "subtotal": 125000
          }
        ],
        "created_at": "2026-01-10T10:00:00Z",
        "updated_at": "2026-01-10T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3200,
      "total_pages": 160
    }
  }
}
```

### PUT /api/v1/admin/orders/:id/status

Update order status.

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): Order ID

**Request Body:**

```json
{
  "status": "SHIPPED",
  "tracking_number": "JNE1234567890"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Order status updated successfully",
  "data": {
    "id": "ord_123",
    "status": "SHIPPED",
    "tracking_number": "JNE1234567890",
    "...": "..."
  }
}
```

---

## Farmer Management

### GET /api/v1/admin/farmers

Get all farmers with filtering.

**Authentication:** Required (Admin only)

**Query Parameters:**

- `is_verified` (boolean): Filter by verification status
- `search` (string): Search by name or description
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "farmers": [
      {
        "id": "frm_123",
        "user_id": "usr_789",
        "name": "Organic Farm",
        "description": "Certified organic farm...",
        "profile_image": "https://...",
        "latitude": -6.914744,
        "longitude": 107.60981,
        "address": "Jl. Raya No. 123",
        "city": "Bandung",
        "state": "West Java",
        "rating": 4.8,
        "total_reviews": 45,
        "is_verified": true,
        "verification_badge": "Certified Organic",
        "user": {
          "id": "usr_789",
          "name": "Farmer John",
          "email": "farmer@example.com",
          "phone_number": "+6281234567890"
        },
        "_count": {
          "products": 25
        },
        "joined_date": "2025-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 120,
      "total_pages": 6
    }
  }
}
```

### PUT /api/v1/admin/farmers/:id/verify

Verify or unverify a farmer.

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): Farmer ID

**Request Body:**

```json
{
  "is_verified": true,
  "verification_badge": "Certified Organic"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Farmer verified successfully",
  "data": {
    "id": "frm_123",
    "is_verified": true,
    "verification_badge": "Certified Organic",
    "...": "..."
  }
}
```

---

## Community Moderation

### GET /api/v1/admin/community/posts

Get all community posts for moderation.

**Authentication:** Required (Admin only)

**Query Parameters:**

- `search` (string): Search by title or content
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "id": "post_123",
        "user_id": "usr_456",
        "user": {
          "id": "usr_456",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "title": "My Farming Journey",
        "content": "Started farming last year...",
        "likes_count": 45,
        "comments_count": 12,
        "_count": {
          "likes": 45,
          "comments": 12
        },
        "created_at": "2026-01-10T09:00:00Z",
        "updated_at": "2026-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 340,
      "total_pages": 17
    }
  }
}
```

### DELETE /api/v1/admin/community/posts/:id

Delete a community post (moderation action).

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): Post ID

**Response:**

```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

### GET /api/v1/admin/community/comments

Get all comments for moderation.

**Authentication:** Required (Admin only)

**Query Parameters:**

- `search` (string): Search by content
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "id": "cmt_123",
        "post_id": "post_456",
        "user_id": "usr_789",
        "user": {
          "id": "usr_789",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "post": {
          "id": "post_456",
          "title": "My Farming Journey"
        },
        "content": "Great post! Very informative.",
        "likes_count": 5,
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 856,
      "total_pages": 43
    }
  }
}
```

### DELETE /api/v1/admin/community/comments/:id

Delete a comment (moderation action).

**Authentication:** Required (Admin only)

**Path Parameters:**

- `id` (string): Comment ID

**Response:**

```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

---

## API Summary

### Total Admin Endpoints: 15

**Dashboard (1 endpoint)**

- GET /api/v1/admin/dashboard

**User Management (4 endpoints)**

- GET /api/v1/admin/users
- GET /api/v1/admin/users/:id
- PUT /api/v1/admin/users/:id
- DELETE /api/v1/admin/users/:id

**Product Management (3 endpoints)**

- GET /api/v1/admin/products
- PUT /api/v1/admin/products/:id
- DELETE /api/v1/admin/products/:id

**Order Management (2 endpoints)**

- GET /api/v1/admin/orders
- PUT /api/v1/admin/orders/:id/status

**Farmer Management (2 endpoints)**

- GET /api/v1/admin/farmers
- PUT /api/v1/admin/farmers/:id/verify

**Community Moderation (4 endpoints)**

- GET /api/v1/admin/community/posts
- DELETE /api/v1/admin/community/posts/:id
- GET /api/v1/admin/community/comments
- DELETE /api/v1/admin/community/comments/:id

---

## Authorization Flow

1. **Login as Admin**: Use `/api/v1/auth/login` with admin credentials
2. **Receive Token**: Get access token with `userType: "ADMIN"`
3. **Access Admin Endpoints**: Include token in Authorization header
4. **Token Validation**: Server validates both authentication AND admin role

---

## Implementation Notes

1. **Admin Role**: Only users with `userType: "ADMIN"` can access admin endpoints
2. **Authorization Middleware**: `verifyAdmin()` function checks both authentication and admin role
3. **Error Responses**:
   - 401 for missing/invalid token
   - 403 for non-admin users
4. **Cascading Deletes**: Deleting users/products/etc. will cascade to related records
5. **Statistics**: Dashboard provides real-time statistics with growth calculations
6. **Pagination**: All list endpoints support pagination for performance
7. **Search**: Text search is case-insensitive using PostgreSQL
8. **Audit Trail**: Consider implementing activity logs for admin actions (future enhancement)

---

## Future Enhancements

1. **Admin Activity Logs**: Track all admin actions
2. **Bulk Operations**: Batch approve/delete/update
3. **Advanced Analytics**: Charts, graphs, trends
4. **Export Functions**: Export data to CSV/Excel
5. **Email Notifications**: Notify users of admin actions
6. **Role Permissions**: Fine-grained permissions for different admin levels
7. **Content Flagging**: User-reported content review system
8. **Automated Reports**: Scheduled email reports for admins
