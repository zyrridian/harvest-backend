# Harvest Admin Panel UI

A complete admin panel interface built with Next.js for managing the Harvest marketplace platform.

## 🚀 Access

Visit: **http://localhost:3000/admin/login**

## 📋 Features

### 1. **Authentication**

- Secure login page
- Admin role verification
- JWT token management
- Auto-redirect for non-admin users

### 2. **Dashboard** (`/admin`)

- Platform overview statistics
  - Users (total, growth, new registrations)
  - Revenue (total, monthly, growth percentage)
  - Orders (total, today, this month, pending)
  - Products (active, inactive)
  - Farmers (verified, unverified)
  - Community (posts, reviews)
- Recent orders list
- Top products by reviews
- Orders breakdown by status
- Real-time data from backend API

### 3. **User Management** (`/admin/users`)

- View all users in table format
- Search by name or email
- Filter by user type (Consumer, Producer, Admin)
- Filter by verification status
- Edit user details
  - Name, email, phone
  - User type
  - Verification status
- Delete users
- Pagination support

### 4. **Product Management** (`/admin/products`)

- View all products with details
- Search by product name or description
- Filter by availability status
- View product information:
  - Name, description
  - Seller information
  - Category
  - Price and stock
  - Availability status
- Toggle product availability (Enable/Disable)
- Delete products
- Pagination support

### 5. **Order Management** (`/admin/orders`)

- View all orders
- Filter by order status (Pending, Processing, Shipped, Delivered, Cancelled)
- View order details:
  - Order number
  - Buyer and seller information
  - Items count
  - Total price
  - Tracking number
  - Status
  - Created date
- Update order status
- Add/update tracking number
- Pagination support

### 6. **Farmer Management** (`/admin/farmers`)

- View all farmer profiles
- Search by farm name or description
- Filter by verification status
- View farmer information:
  - Farm name and description
  - Owner details
  - Contact information
  - Location
  - Product count
  - Verification status
  - Verification badge
- Verify/unverify farmers
- Add verification badges (e.g., "Organic Certified", "Premium Farmer")
- Pagination support

### 7. **Community Moderation** (`/admin/community`)

- **Posts Tab**
  - View all community posts
  - Search posts by title or content
  - View post details:
    - Title and content
    - Author information
    - Created date
    - Likes and comments count
  - Delete inappropriate posts
- **Comments Tab**
  - View all comments
  - Search comments by content
  - View comment details:
    - Comment content
    - Author information
    - Associated post
    - Created date
    - Likes count
  - Delete inappropriate comments
- Pagination for both posts and comments

## 🎨 UI Features

### Design

- Clean, modern interface with green theme
- Responsive layout (desktop-first)
- Card-based components
- Consistent color scheme:
  - Primary: Green (#059669)
  - Success: Green
  - Warning: Yellow/Orange
  - Danger: Red
  - Neutral: Gray

### Navigation

- Fixed sidebar with navigation menu
- Active page highlighting
- Quick access to all sections:
  - Dashboard 📊
  - Users 👥
  - Products 🛍️
  - Orders 📦
  - Farmers 🌾
  - Community 💬
- Logout button at the bottom

### Components

- **Stat Cards**: Display key metrics with icons and growth indicators
- **Data Tables**: Sortable, filterable tables for data management
- **Modals**: For editing and form submissions
- **Badges**: Visual status indicators
- **Pagination**: Easy navigation through large datasets
- **Search Bars**: Quick filtering of data
- **Dropdowns**: Filter by various criteria

## 🔒 Security

- JWT authentication required
- Admin role verification on all pages
- Auto-redirect to login if not authenticated
- Protected API routes with Bearer tokens
- LocalStorage for token management

## 💻 Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **API Communication**: Fetch API
- **Routing**: Next.js App Router

## 📱 Pages Structure

```
/admin
├── /login              → Admin login page
├── /                   → Dashboard (overview & stats)
├── /users              → User management
├── /products           → Product moderation
├── /orders             → Order monitoring
├── /farmers            → Farmer verification
└── /community          → Content moderation
```

## 🛠️ Setup & Usage

### Prerequisites

1. Backend server running at `http://localhost:3000`
2. Admin user account in database with `userType: "ADMIN"`

### Testing Steps

1. **Create Admin User**

   ```sql
   UPDATE "User" SET user_type = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

2. **Login**

   - Navigate to `http://localhost:3000/admin/login`
   - Enter admin credentials
   - System validates admin role
   - Redirects to dashboard on success

3. **Explore Features**
   - View dashboard statistics
   - Manage users, products, orders
   - Verify farmers
   - Moderate community content

## 📊 API Integration

All pages connect to the backend API at `/api/v1/admin/*`:

- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/users` - List users
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `GET /api/v1/admin/products` - List products
- `PUT /api/v1/admin/products/:id` - Update product
- `DELETE /api/v1/admin/products/:id` - Delete product
- `GET /api/v1/admin/orders` - List orders
- `PUT /api/v1/admin/orders/:id/status` - Update order status
- `GET /api/v1/admin/farmers` - List farmers
- `PUT /api/v1/admin/farmers/:id/verify` - Verify farmer
- `GET /api/v1/admin/community/posts` - List posts
- `DELETE /api/v1/admin/community/posts/:id` - Delete post
- `GET /api/v1/admin/community/comments` - List comments
- `DELETE /api/v1/admin/community/comments/:id` - Delete comment

## 🔄 Data Flow

1. **Authentication**: Login → JWT tokens stored in localStorage
2. **Authorization**: Each request includes `Authorization: Bearer {token}` header
3. **Data Fetching**: Components fetch data on mount and after updates
4. **Mutations**: User actions trigger API calls with confirmation
5. **Feedback**: Success/error messages via alerts
6. **Refresh**: Data automatically refreshes after mutations

## 🎯 Future Enhancements

- [ ] Export data to CSV/Excel
- [ ] Advanced analytics with charts (recharts/chart.js)
- [ ] Bulk operations (multi-select and batch actions)
- [ ] Real-time updates with WebSockets
- [ ] Activity logs and audit trail
- [ ] Email notifications for admin actions
- [ ] Advanced filters and saved filter presets
- [ ] User impersonation for support
- [ ] Dark mode toggle
- [ ] Mobile responsive design
- [ ] Image preview in product listings
- [ ] Rich text editor for content moderation
- [ ] File upload management

## 📝 Notes

- All timestamps displayed in Indonesian locale (id-ID)
- Currency formatted as Indonesian Rupiah (IDR)
- Pagination default: 10 items per page
- All delete actions require confirmation
- Edit forms validate input before submission
- Status colors consistent across all pages

## 🐛 Known Issues

- None at the moment

## 📞 Support

For issues or questions about the admin panel, refer to the main project README or API documentation.
