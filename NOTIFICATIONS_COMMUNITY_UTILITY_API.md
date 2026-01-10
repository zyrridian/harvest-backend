# Notifications, Community, and Utility API Documentation

This document provides detailed information about the Notifications, Community Posts, and Utility endpoints implemented in the Harvest Backend API.

## Notifications API

### GET /api/v1/notifications

Get user's notifications with filtering and pagination.

**Authentication:** Required

**Query Parameters:**

- `filter` (string): Filter notifications - `all`, `unread`, `read`
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "user_id": "usr_456",
        "type": "ORDER_PLACED",
        "title": "New Order Placed",
        "message": "Your order #12345 has been placed successfully",
        "related_type": "order",
        "related_id": "ord_123",
        "image_url": "https://...",
        "action_url": "/orders/ord_123",
        "is_read": false,
        "read_at": null,
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "total_pages": 2
    }
  }
}
```

### PUT /api/v1/notifications/:id/read

Mark a notification as read.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Notification ID

**Response:**

```json
{
  "status": "success",
  "message": "Notification marked as read",
  "data": {
    "id": "notif_123",
    "is_read": true,
    "read_at": "2026-01-10T10:05:00Z"
  }
}
```

### DELETE /api/v1/notifications/:id

Delete a notification.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Notification ID

**Response:**

```json
{
  "status": "success",
  "message": "Notification deleted successfully"
}
```

### GET /api/v1/notification-settings

Get user's notification settings.

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "user_id": "usr_123",
    "enable_push_notifications": true,
    "enable_order_updates": true,
    "enable_new_messages": true,
    "enable_reviews": true,
    "enable_promotions": false,
    "enable_community": true,
    "enable_email_notifications": true
  }
}
```

### PUT /api/v1/notification-settings

Update user's notification settings.

**Authentication:** Required

**Request Body:**

```json
{
  "enable_push_notifications": true,
  "enable_order_updates": true,
  "enable_new_messages": true,
  "enable_reviews": true,
  "enable_promotions": false,
  "enable_community": true,
  "enable_email_notifications": true
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Notification settings updated successfully",
  "data": {
    "user_id": "usr_123",
    "enable_push_notifications": true,
    "enable_order_updates": true,
    "enable_new_messages": true,
    "enable_reviews": true,
    "enable_promotions": false,
    "enable_community": true,
    "enable_email_notifications": true
  }
}
```

---

## Community Posts API

### GET /api/v1/community/posts

Get list of community posts with filtering.

**Authentication:** Optional (user-specific features require auth)

**Query Parameters:**

- `filter` (string): Filter posts - `all`, `following`, `my_posts`
- `tag` (string): Filter by tag
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
          "avatar_url": "https://..."
        },
        "title": "My Organic Farm Journey",
        "content": "Started my organic farm last year...",
        "images": [
          {
            "id": "img_001",
            "url": "https://...",
            "thumbnail_url": "https://...",
            "display_order": 0
          }
        ],
        "tags": [
          {
            "post_id": "post_123",
            "tag": "organic"
          }
        ],
        "likes_count": 45,
        "comments_count": 12,
        "is_liked_by_user": true,
        "created_at": "2026-01-10T09:00:00Z",
        "updated_at": "2026-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

### POST /api/v1/community/posts

Create a new community post.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "My Organic Farm Journey",
  "content": "Started my organic farm last year and it has been amazing...",
  "images": ["https://image1.jpg", "https://image2.jpg"],
  "tags": ["organic", "farming", "sustainability"]
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "id": "post_123",
    "user_id": "usr_456",
    "title": "My Organic Farm Journey",
    "content": "Started my organic farm last year...",
    "images": [...],
    "tags": [...],
    "likes_count": 0,
    "comments_count": 0,
    "created_at": "2026-01-10T09:00:00Z"
  }
}
```

### GET /api/v1/community/posts/:id

Get a specific community post by ID.

**Authentication:** Optional

**Path Parameters:**

- `id` (string): Post ID

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "post_123",
    "user": {...},
    "title": "My Organic Farm Journey",
    "content": "...",
    "images": [...],
    "tags": [...],
    "likes_count": 45,
    "comments_count": 12,
    "is_liked_by_user": true,
    "created_at": "2026-01-10T09:00:00Z"
  }
}
```

### PUT /api/v1/community/posts/:id

Update a community post.

**Authentication:** Required (must be post owner)

**Path Parameters:**

- `id` (string): Post ID

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Post updated successfully",
  "data": {...}
}
```

### DELETE /api/v1/community/posts/:id

Delete a community post.

**Authentication:** Required (must be post owner)

**Path Parameters:**

- `id` (string): Post ID

**Response:**

```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

### POST /api/v1/community/posts/:id/like

Like a community post.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Post ID

**Response:**

```json
{
  "status": "success",
  "message": "Post liked successfully"
}
```

### DELETE /api/v1/community/posts/:id/like

Unlike a community post.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Post ID

**Response:**

```json
{
  "status": "success",
  "message": "Post unliked successfully"
}
```

### GET /api/v1/community/posts/:id/comments

Get comments for a post.

**Authentication:** Optional

**Path Parameters:**

- `id` (string): Post ID

**Query Parameters:**

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
        "post_id": "post_123",
        "user_id": "usr_789",
        "user": {
          "id": "usr_789",
          "name": "Jane Smith",
          "avatar_url": "https://..."
        },
        "content": "Great post! Very informative.",
        "likes_count": 5,
        "is_liked_by_user": false,
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "total_pages": 1
    }
  }
}
```

### POST /api/v1/community/posts/:id/comments

Add a comment to a post.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Post ID

**Request Body:**

```json
{
  "content": "Great post! Very informative."
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Comment added successfully",
  "data": {
    "id": "cmt_123",
    "post_id": "post_123",
    "user_id": "usr_789",
    "content": "Great post! Very informative.",
    "likes_count": 0,
    "created_at": "2026-01-10T10:00:00Z"
  }
}
```

### DELETE /api/v1/community/comments/:id

Delete a comment.

**Authentication:** Required (must be comment owner)

**Path Parameters:**

- `id` (string): Comment ID

**Response:**

```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

### POST /api/v1/community/comments/:id/like

Like a comment.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Comment ID

**Response:**

```json
{
  "status": "success",
  "message": "Comment liked successfully"
}
```

### DELETE /api/v1/community/comments/:id/like

Unlike a comment.

**Authentication:** Required

**Path Parameters:**

- `id` (string): Comment ID

**Response:**

```json
{
  "status": "success",
  "message": "Comment unliked successfully"
}
```

---

## Utility API

### POST /api/v1/upload/image

Upload an image and store metadata.

**Authentication:** Required

**Request Body:**

```json
{
  "url": "https://storage.example.com/image.jpg",
  "thumbnail_url": "https://storage.example.com/image_thumb.jpg",
  "medium_url": "https://storage.example.com/image_medium.jpg",
  "file_name": "farm-photo.jpg",
  "file_size": 1024000,
  "mime_type": "image/jpeg",
  "width": 1920,
  "height": 1080,
  "type": "product"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "id": "img_123",
    "user_id": "usr_456",
    "url": "https://storage.example.com/image.jpg",
    "thumbnail_url": "https://storage.example.com/image_thumb.jpg",
    "medium_url": "https://storage.example.com/image_medium.jpg",
    "file_name": "farm-photo.jpg",
    "file_size": 1024000,
    "mime_type": "image/jpeg",
    "width": 1920,
    "height": 1080,
    "type": "product",
    "uploaded_at": "2026-01-10T10:00:00Z"
  }
}
```

### POST /api/v1/upload/video

Upload a video and store metadata.

**Authentication:** Required

**Request Body:**

```json
{
  "url": "https://storage.example.com/video.mp4",
  "thumbnail_url": "https://storage.example.com/video_thumb.jpg",
  "file_name": "farm-tour.mp4",
  "file_size": 10240000,
  "mime_type": "video/mp4",
  "duration": 120,
  "width": 1920,
  "height": 1080,
  "type": "product",
  "upload_status": "completed"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Video uploaded successfully",
  "data": {
    "id": "vid_123",
    "user_id": "usr_456",
    "url": "https://storage.example.com/video.mp4",
    "thumbnail_url": "https://storage.example.com/video_thumb.jpg",
    "file_name": "farm-tour.mp4",
    "file_size": 10240000,
    "mime_type": "video/mp4",
    "duration": 120,
    "width": 1920,
    "height": 1080,
    "type": "product",
    "upload_status": "completed",
    "uploaded_at": "2026-01-10T10:00:00Z"
  }
}
```

### POST /api/v1/share/generate

Generate a shareable link for a resource.

**Authentication:** Not required

**Request Body:**

```json
{
  "reference_type": "product",
  "reference_id": "prd_123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Share link generated successfully",
  "data": {
    "share_url": "http://localhost:3000/share/abc12345",
    "short_code": "abc12345",
    "share_count": 1
  }
}
```

---

## Database Models

### Notification

- id (UUID)
- user_id (FK to User)
- type (NotificationType enum)
- title (string)
- message (text)
- related_type (string, nullable)
- related_id (string, nullable)
- image_url (text, nullable)
- action_url (text, nullable)
- is_read (boolean, default: false)
- read_at (datetime, nullable)
- created_at (datetime)

### NotificationSettings

- user_id (UUID, PK, FK to User)
- enable_push_notifications (boolean, default: true)
- enable_order_updates (boolean, default: true)
- enable_new_messages (boolean, default: true)
- enable_reviews (boolean, default: true)
- enable_promotions (boolean, default: true)
- enable_community (boolean, default: true)
- enable_email_notifications (boolean, default: true)

### CommunityPost

- id (UUID)
- user_id (FK to User)
- title (string)
- content (text)
- likes_count (integer, default: 0)
- comments_count (integer, default: 0)
- created_at (datetime)
- updated_at (datetime)

### PostImage

- id (UUID)
- post_id (FK to CommunityPost)
- url (text)
- thumbnail_url (text, nullable)
- display_order (integer)

### PostTag

- post_id (FK to CommunityPost)
- tag (string)
- Composite PK: (post_id, tag)

### PostLike

- post_id (FK to CommunityPost)
- user_id (FK to User)
- created_at (datetime)
- Composite PK: (post_id, user_id)

### PostComment

- id (UUID)
- post_id (FK to CommunityPost)
- user_id (FK to User)
- content (text)
- likes_count (integer, default: 0)
- created_at (datetime)

### CommentLike

- comment_id (FK to PostComment)
- user_id (FK to User)
- created_at (datetime)
- Composite PK: (comment_id, user_id)

### UploadedImage

- id (UUID)
- user_id (FK to User, nullable)
- url (text)
- thumbnail_url (text, nullable)
- medium_url (text, nullable)
- file_name (string)
- file_size (integer)
- mime_type (string)
- width (integer, nullable)
- height (integer, nullable)
- type (string, nullable)
- uploaded_at (datetime)

### UploadedVideo

- id (UUID)
- user_id (FK to User, nullable)
- url (text)
- thumbnail_url (text, nullable)
- file_name (string)
- file_size (integer)
- mime_type (string)
- duration (integer, nullable)
- width (integer, nullable)
- height (integer, nullable)
- type (string, nullable)
- upload_status (string, default: 'pending')
- uploaded_at (datetime)

### ShareLink

- id (UUID)
- reference_type (string)
- reference_id (string)
- short_code (string, unique)
- share_count (integer, default: 0)
- created_at (datetime)

---

## Enums

### NotificationType

- ORDER_PLACED
- ORDER_CONFIRMED
- ORDER_SHIPPED
- ORDER_DELIVERED
- ORDER_CANCELLED
- NEW_MESSAGE
- NEW_REVIEW
- REVIEW_RESPONSE
- PROMOTION
- COMMUNITY_LIKE
- COMMUNITY_COMMENT
- SYSTEM

---

## API Summary

### Notifications (4 endpoints)

- GET /api/v1/notifications - Get user's notifications
- PUT /api/v1/notifications/:id/read - Mark notification as read
- DELETE /api/v1/notifications/:id - Delete notification
- GET /api/v1/notification-settings - Get notification settings
- PUT /api/v1/notification-settings - Update notification settings

### Community Posts (11 endpoints)

- GET /api/v1/community/posts - Get community posts
- POST /api/v1/community/posts - Create post
- GET /api/v1/community/posts/:id - Get post details
- PUT /api/v1/community/posts/:id - Update post
- DELETE /api/v1/community/posts/:id - Delete post
- POST /api/v1/community/posts/:id/like - Like post
- DELETE /api/v1/community/posts/:id/like - Unlike post
- GET /api/v1/community/posts/:id/comments - Get comments
- POST /api/v1/community/posts/:id/comments - Add comment
- DELETE /api/v1/community/comments/:id - Delete comment
- POST /api/v1/community/comments/:id/like - Like comment
- DELETE /api/v1/community/comments/:id/like - Unlike comment

### Utility (3 endpoints)

- POST /api/v1/upload/image - Upload image metadata
- POST /api/v1/upload/video - Upload video metadata
- POST /api/v1/share/generate - Generate share link

**Total New Endpoints: 18**

---

## Implementation Notes

1. **Notifications**: All notifications are created by system events. The API provides read-only access for users to view and manage their notifications.

2. **Community Posts**: Posts support images, tags, likes, and comments. Unauthenticated users can browse posts, but interaction requires authentication.

3. **Utility Endpoints**: Upload endpoints store metadata only. Actual file uploads should be handled by a separate file storage service (e.g., AWS S3, Cloudinary).

4. **Share Links**: Generate short URLs using nanoid. Share count is incremented each time the link is generated or accessed.

5. **Authorization**: All endpoints verify user ownership before allowing updates or deletions.

6. **Pagination**: All list endpoints support pagination with `page` and `limit` parameters.
