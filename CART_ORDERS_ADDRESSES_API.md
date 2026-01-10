# Cart, Orders, and Addresses API Implementation

## Summary

Successfully implemented comprehensive Cart, Orders, and Addresses API endpoints for the Harvest Mobile App backend.

## Database Schema Updates

### New Models Added

1. **Cart System**

   - `Cart` - User shopping cart
   - `CartItem` - Individual items in cart with selection, pricing, and notes

2. **Order System**

   - `Order` - Order management with full lifecycle (payment, delivery, cancellation)
   - `OrderItem` - Order line items with product snapshot

3. **Address System**
   - `Address` - User delivery addresses with location data and primary flag

## API Endpoints Implemented

### Cart API (`/api/v1/cart`)

#### 1. GET /cart

- **Purpose**: Get user's shopping cart with all items
- **Features**:
  - Automatic cart creation if not exists
  - Items grouped by seller
  - Calculates delivery fees per seller
  - Free delivery threshold tracking
  - Subtotals, discounts, and grand total
  - Unavailable items detection
  - Returns selected/unselected items

#### 2. DELETE /cart

- **Purpose**: Clear entire cart
- **Features**:
  - Removes all cart items
  - Cart entity remains for future use

#### 3. POST /cart/items

- **Purpose**: Add product to cart
- **Features**:
  - Auto-creates cart if needed
  - Updates quantity if product already in cart
  - Applies active discounts automatically
  - Calculates subtotals
  - Returns cart summary

#### 4. PUT /cart/items/:id

- **Purpose**: Update cart item quantity or notes
- **Features**:
  - Ownership verification
  - Recalculates subtotal on quantity change
  - Updates notes
  - Returns updated cart totals

#### 5. DELETE /cart/items/:id

- **Purpose**: Remove item from cart
- **Features**:
  - Ownership verification
  - Returns remaining cart summary

#### 6. PATCH /cart/items/:id/select

- **Purpose**: Toggle cart item selection for checkout
- **Features**:
  - Select/unselect items before checkout
  - Calculates selected items total
  - Enables partial cart checkout

### Orders API (`/api/v1/orders`)

#### 1. GET /orders

- **Purpose**: List user's orders with filters
- **Features**:
  - Filter by role (buyer/seller)
  - Filter by status
  - Pagination support
  - Returns order preview with first 2 items
  - Shows seller info, status, totals

#### 2. POST /orders

- **Purpose**: Create new order from selected cart items
- **Features**:
  - Creates separate orders per seller
  - Calculates pricing (subtotal, delivery, service fees)
  - Applies discounts from cart
  - Auto-generates unique order numbers (FM + date + random)
  - Stores product snapshot (name, image)
  - Removes ordered items from cart
  - Returns payment instructions

#### 3. GET /orders/:id

- **Purpose**: Get detailed order information
- **Features**:
  - Complete order details
  - Seller information
  - All order items
  - Delivery address details
  - Pricing breakdown
  - Payment status
  - Order timeline
  - Accessible by buyer or seller

#### 4. PATCH /orders/:id/cancel

- **Purpose**: Cancel an order
- **Features**:
  - Buyer or seller can cancel
  - Validates order can be cancelled (not already delivered/cancelled)
  - Records cancellation reason
  - Returns refund info if paid
  - Sets cancellation timestamp

### Addresses API (`/api/v1/addresses`)

#### 1. GET /addresses

- **Purpose**: Get all user's saved addresses
- **Features**:
  - Sorted by primary first, then by creation date
  - Complete address details with location data
  - Returns total count

#### 2. POST /addresses

- **Purpose**: Add new delivery address
- **Features**:
  - Validates required fields
  - Auto-unsets other primary if setting as primary
  - Stores province/city/district IDs
  - Optional GPS coordinates
  - Address notes support

#### 3. PUT /addresses/:id

- **Purpose**: Update existing address
- **Features**:
  - Ownership verification
  - Partial updates (only changed fields)
  - Updates label, recipient, phone, address, notes

#### 4. DELETE /addresses/:id

- **Purpose**: Delete an address
- **Features**:
  - Ownership verification
  - Safe deletion (orders reference handled by DB)

#### 5. PATCH /addresses/:id/primary

- **Purpose**: Set address as primary
- **Features**:
  - Ownership verification
  - Auto-unsets all other primary addresses
  - Sets selected address as primary

## Key Features Implemented

### Shopping Cart

- **Smart Cart Management**: Auto-creates cart, merges items if already exist
- **Seller Grouping**: Items grouped by seller for separate checkouts
- **Dynamic Pricing**: Applies active discounts, calculates totals
- **Selective Checkout**: Select/unselect items before ordering
- **Delivery Fee Logic**: Per-seller delivery fees with free delivery thresholds
- **Availability Tracking**: Marks items as unavailable if product out of stock

### Order Management

- **Multi-Seller Orders**: Creates separate orders per seller automatically
- **Order Numbers**: Unique FM-prefixed order numbers with date
- **Product Snapshots**: Stores product name and image at time of order
- **Order Lifecycle**: Pending → Paid → Processing → Shipped → Delivered
- **Cancellation**: Both buyer and seller can cancel with reason tracking
- **Payment Tracking**: Payment method, status, and paid timestamp

### Address System

- **Primary Address**: One primary address per user
- **Location Data**: Province/city/district with IDs for integration
- **GPS Coordinates**: Optional latitude/longitude for mapping
- **Verification**: Address verification status tracking
- **Flexible Updates**: Partial field updates supported

## Business Logic

### Cart Calculations

```
Item Subtotal = (Discount Price OR Regular Price) × Quantity
Cart Subtotal = Sum of all selected items
Delivery Fee per Seller = 15,000 IDR (waived if subtotal ≥ 100,000)
Service Fee = 2,000 IDR (fixed)
Grand Total = Subtotal + Total Delivery Fees + Service Fee
```

### Order Creation Flow

1. Validate cart items belong to user
2. Group items by seller
3. For each seller:
   - Create order with unique number
   - Calculate pricing (subtotal, fees, discounts)
   - Create order items with product snapshots
   - Set status to "pending_payment"
4. Remove ordered items from cart
5. Return payment instructions

### Delivery Fee Logic

- Base fee: 15,000 IDR per seller
- Free delivery threshold: 100,000 IDR
- Calculated per seller (not per total cart)

## Authentication & Security

- All endpoints require JWT authentication
- Ownership verification for cart items, orders, and addresses
- Orders accessible by both buyer and seller
- Prevents unauthorized modifications
- Safe cancellation checks (status validation)

## Database Relations

### Cart Relations

```
User (1) ─── (1) Cart
Cart (1) ─── (Many) CartItem
CartItem (Many) ─── (1) Product
```

### Order Relations

```
User (Buyer) (1) ─── (Many) Order
User (Seller) (1) ─── (Many) Order
Order (1) ─── (Many) OrderItem
Order (Many) ─── (1) Address
OrderItem (Many) ─── (1) Product
```

### Address Relations

```
User (1) ─── (Many) Address
Address (1) ─── (Many) Order
```

## Error Handling

- **400**: Missing required fields, invalid data
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (accessing other user's resources)
- **404**: Resource not found (cart item, order, address)
- **500**: Internal server error

## Response Format

All endpoints follow consistent response format:

```json
{
  "status": "success" | "error",
  "message": "...",
  "data": { ... }
}
```

## Testing

All endpoints documented in Swagger UI at:
**http://localhost:3000/docs**

Test flow:

1. Register/Login to get access token
2. Add products to cart
3. Update cart items (quantity, selection)
4. Add delivery address
5. Create order from selected cart items
6. View order details
7. Cancel order if needed

## Next Steps

1. **Payment Integration**: Integrate with payment gateways (Midtrans, Xendit)
2. **Province/City Lookup**: Add endpoints for location data (GET /addresses/provinces, /cities, /districts)
3. **Order Tracking**: Add real-time tracking updates
4. **Delivery Calculation**: Dynamic delivery fee based on distance
5. **Stock Management**: Decrease product stock on order creation
6. **Notifications**: Send order status notifications
7. **Reviews**: Allow reviews after order delivery

## Notes

- Order numbers format: `FM{YEAR}{MONTH}{DAY}{RANDOM}`
- Service fee is fixed at 2,000 IDR
- Base delivery fee is 15,000 IDR per seller
- Free delivery threshold is 100,000 IDR per seller
- Orders store product snapshots (name, image) to preserve data
- Cart items auto-apply active discounts
- Multiple addresses per user, one can be primary
- Both buyer and seller can cancel orders (with different permissions later)

## Total Endpoints Count

**Cart**: 6 endpoints
**Orders**: 4 endpoints  
**Addresses**: 5 endpoints

**Total**: 15 new API endpoints fully functional and documented! 🎉
