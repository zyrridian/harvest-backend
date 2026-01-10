# Products, Categories, and Farmers API Implementation

## Summary

Successfully implemented comprehensive Products, Categories, and Farmers API endpoints for the Harvest Mobile App backend.

## Database Schema Updates

### New Models Added

1. **Categories**

   - `Category` - Main product categories with emoji and gradient colors
   - `Subcategory` - Subcategories under main categories

2. **Products (Enhanced)**

   - `Product` - Enhanced with full e-commerce fields
   - `ProductImage` - Multiple images per product with primary flag
   - `ProductVideo` - Product videos with thumbnails
   - `ProductSpecification` - Key-value specifications
   - `ProductTag` - Tagging system for products
   - `ProductCertification` - Organic and other certifications
   - `ProductDiscount` - Discount management with validity periods
   - `Favorite` - User favorites/wishlist
   - `ProductView` - View tracking for analytics

3. **Farmers/Sellers**
   - `Farmer` - Farmer profiles with location and verification
   - `FarmerSpecialty` - Farmer specialties/expertise

## API Endpoints Implemented

### Products API (`/api/v1/products`)

#### 1. GET /products

- **Purpose**: List products with filters and pagination
- **Features**:
  - Pagination (page, limit)
  - Filters: category, seller_id, is_organic, min_price, max_price
  - Sorting: price, rating, newest, popular
  - Returns product list with primary images, tags, and active discounts

#### 2. GET /products/:id

- **Purpose**: Get detailed product information
- **Features**:
  - Complete product details
  - All images and videos
  - Specifications and certifications
  - Seller information with farmer profile
  - Active discounts with calculated savings
  - Rating distribution (placeholder for future reviews)

#### 3. POST /products/:id/favorite

- **Purpose**: Add product to user's favorites
- **Features**:
  - Requires authentication
  - Prevents duplicate favorites
  - Returns favorited status

#### 4. DELETE /products/:id/favorite

- **Purpose**: Remove product from favorites
- **Features**:
  - Requires authentication
  - Safe removal (no error if not favorited)

#### 5. POST /products/:id/view

- **Purpose**: Track product views for analytics
- **Features**:
  - Optional authentication (tracks anonymous views)
  - Increments view count
  - Creates view record with user ID if authenticated

### Categories API (`/api/v1/categories`)

#### 1. GET /categories

- **Purpose**: List all active categories
- **Features**:
  - Returns categories ordered by display_order
  - Includes product count for each category
  - Shows emoji and gradient colors for UI

#### 2. GET /categories/:id

- **Purpose**: Get category details
- **Features**:
  - Accepts category ID or slug
  - Returns category info with product count

#### 3. GET /categories/:id/products

- **Purpose**: Get products in a category
- **Features**:
  - Pagination support
  - Sorting: price, rating, newest
  - Returns products with images and discounts
  - Filters only available products

### Farmers API (`/api/v1/farmers`)

#### 1. GET /farmers

- **Purpose**: List farmers/sellers with filters
- **Features**:
  - Search by name or description
  - Filter by specialties
  - Filter by map feature availability
  - Filter by minimum rating
  - Returns farmer profiles with online status

#### 2. GET /farmers/:id

- **Purpose**: Get detailed farmer profile
- **Features**:
  - Complete farmer information
  - Specialties list
  - Location data
  - Response rate and time
  - Verification status and badges
  - Online status

#### 3. GET /farmers/:id/products

- **Purpose**: Get products from a specific farmer
- **Features**:
  - Pagination support
  - Returns farmer's available products
  - Includes product images and discounts

#### 4. GET /farmers/:id/reviews

- **Purpose**: Get reviews for a farmer
- **Features**:
  - Pagination support
  - Currently returns placeholder (TODO: implement reviews system)

#### 5. GET /farmers/nearby

- **Purpose**: Find nearby farmers based on location
- **Features**:
  - Requires latitude and longitude
  - Configurable search radius (default 10km)
  - Uses Haversine formula for distance calculation
  - Returns farmers sorted by distance
  - Limit results (default 20)

## Key Features

### Authentication

- Products favorites require JWT authentication
- View tracking supports both authenticated and anonymous users
- Proper error handling for invalid/expired tokens

### Data Relations

- Products include seller/farmer information
- Automatic loading of related data (images, discounts, tags)
- Efficient use of Prisma includes and selects

### Filtering & Sorting

- Comprehensive filter options across all list endpoints
- Multiple sort options (price, rating, newest, popular)
- Pagination with metadata (total pages, has_next, etc.)

### Performance

- Uses Promise.all for parallel database queries
- Optimized queries with selective field loading
- Indexed database fields for fast lookups

### Error Handling

- Consistent error response format
- Proper HTTP status codes
- Detailed error messages in development

## Database Indexes

All models include proper indexes for:

- Foreign keys
- Search fields (slug, category, seller)
- Filter fields (isAvailable, isVerified)
- Sort fields (displayOrder, createdAt)
- Location fields (latitude, longitude)

## Testing

All endpoints are documented in Swagger UI at:
**http://localhost:3000/docs**

You can test all endpoints directly from the Swagger interface.

## Next Steps

1. Implement Reviews system for products and farmers
2. Add cloud storage integration for avatar/product image uploads
3. Implement real-time distance calculation using user location
4. Add search functionality with full-text search
5. Implement Cart, Orders, and other remaining endpoints

## Notes

- All currency values are in IDR (Indonesian Rupiah)
- Distance calculations use kilometers
- View tracking is implemented for analytics
- Farmer reviews endpoint is a placeholder for future implementation
- Rating distribution in product details is a placeholder for future reviews system
