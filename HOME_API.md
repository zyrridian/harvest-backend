# Home API Endpoint

## Overview

The Home API (`GET /api/v1/home`) returns all the data needed for the main home screen of the Harvest Market app.

## Endpoint

```
GET /api/v1/home
```

## Query Parameters

| Parameter   | Type   | Required | Default | Description                                         |
| ----------- | ------ | -------- | ------- | --------------------------------------------------- |
| `latitude`  | number | No       | -       | User's current latitude for finding nearby farmers  |
| `longitude` | number | No       | -       | User's current longitude for finding nearby farmers |
| `radius`    | number | No       | 10      | Search radius in kilometers for nearby farmers      |

## Response Structure

```json
{
  "status": "success",
  "data": {
    "categories": [...],
    "pre_orders": [...],
    "nearby_farmers": {...},
    "fresh_today": [...]
  }
}
```

## Response Sections

### 1. Categories

Shop by Category section - displays 8 main categories.

```json
"categories": [
  {
    "id": "uuid",
    "name": "Vegetables",
    "slug": "vegetables",
    "emoji": "🥦",
    "gradient_colors": ["#E8F5E9", "#A5D6A7"],
    "product_count": 45
  }
]
```

**UI Mapping:**

- Green circle → Vegetables 🥦
- Pink circle → Fruits 🍓
- Purple circle → Meat 🥩
- Blue circle → Fish 🐟
- Yellow circle → Dairy 🧀
- Light yellow → Eggs 🥚
- Beige → Grains 🌾
- Gray → More (see all)

### 2. Pre-Orders (Upcoming Harvests)

Items available for pre-order with harvest countdown.

```json
"pre_orders": [
  {
    "id": "uuid",
    "name": "Organic Tomatoes",
    "slug": "organic-tomatoes",
    "price": 25000,
    "currency": "IDR",
    "unit": "kg",
    "stock_quantity": 22,
    "harvest_date": "2026-02-03T00:00:00.000Z",
    "days_until_harvest": 1,
    "countdown_label": "Tomorrow",
    "is_organic": true,
    "image": "https://...",
    "farmer": {
      "name": "Green Valley Farm",
      "profile_image": "https://...",
      "is_verified": true
    },
    "pre_order_count": 12
  }
]
```

**Countdown Labels:**

- `"Today"` - Harvesting today
- `"Tomorrow"` - Harvesting tomorrow
- `"4 days"` - Number of days until harvest

**UI Mapping:**

- Orange badge with clock icon → countdown_label
- Progress bar → pre_order_count
- "22 kg left" → stock_quantity + unit
- "Rp 25.000" → price formatted

### 3. Nearby Farmers

Farmers/markets near the user's location.

```json
"nearby_farmers": {
  "count": 3,
  "radius_km": 10,
  "farmers": [
    {
      "id": "uuid",
      "name": "Green Valley Farm",
      "profile_image": "https://...",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "address": "Jl. Raya No. 123",
      "city": "Jakarta",
      "rating": 4.8,
      "total_products": 25,
      "is_verified": true,
      "distance_km": 1.2
    }
  ]
}
```

**UI Mapping:**

- Map with pins → Use latitude/longitude
- "3 Markets Open" → count
- "Within 5km range" → radius_km
- Orange/black dots → farmer locations on map

### 4. Fresh Today

Products available for immediate purchase.

```json
"fresh_today": [
  {
    "id": "uuid",
    "name": "Fresh Lettuce",
    "slug": "fresh-lettuce",
    "price": 2.49,
    "currency": "USD",
    "unit": "head",
    "stock_quantity": 50,
    "rating": 4.5,
    "review_count": 23,
    "is_organic": true,
    "image": "https://...",
    "farmer": {
      "name": "Green Valley Farm",
      "profile_image": "https://...",
      "is_verified": true
    }
  }
]
```

**UI Mapping:**

- Product card with image
- Product name
- Farmer name below
- Price at bottom
- Heart icon for favorites (separate API)

## Usage Examples

### Basic Request (No Location)

```bash
curl http://localhost:3000/api/v1/home
```

Returns all sections except nearby farmers will be empty.

### With Location (Nearby Farmers)

```bash
curl "http://localhost:3000/api/v1/home?latitude=-6.2088&longitude=106.8456&radius=5"
```

Returns all sections including nearby farmers within 5km.

### JavaScript/TypeScript Example

```typescript
// Fetch home data
async function fetchHomeData(location?: { lat: number; lng: number }) {
  const params = new URLSearchParams();

  if (location) {
    params.append("latitude", location.lat.toString());
    params.append("longitude", location.lng.toString());
    params.append("radius", "10");
  }

  const response = await fetch(`/api/v1/home?${params}`);
  const data = await response.json();

  return data;
}

// Usage
const homeData = await fetchHomeData({
  lat: -6.2088,
  lng: 106.8456,
});

console.log(homeData.data.categories); // Categories
console.log(homeData.data.pre_orders); // Pre-orders
console.log(homeData.data.nearby_farmers); // Nearby farmers
console.log(homeData.data.fresh_today); // Fresh products
```

### React Native Example

```typescript
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

function HomeScreen() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();

      let params = '';
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        params = `?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&radius=10`;
      }

      const response = await fetch(`https://your-api.com/api/v1/home${params}`);
      const data = await response.json();
      setHomeData(data.data);
    }

    loadHomeData();
  }, []);

  return (
    <View>
      {/* Render categories */}
      <CategoryGrid categories={homeData?.categories} />

      {/* Render pre-orders */}
      <PreOrderList items={homeData?.pre_orders} />

      {/* Render nearby farmers */}
      <FarmersMap farmers={homeData?.nearby_farmers} />

      {/* Render fresh products */}
      <ProductGrid products={homeData?.fresh_today} />
    </View>
  );
}
```

## UI Component Mapping

### Categories Section

```typescript
// Shop by Category grid
<View style={styles.categoryGrid}>
  {categories.map(category => (
    <CategoryCard
      key={category.id}
      name={category.name}
      emoji={category.emoji}
      gradientColors={category.gradient_colors}
      productCount={category.product_count}
    />
  ))}
</View>
```

### Pre-Orders Section

```typescript
// Pre-Order Fresh Harvests
<View>
  <Text>🌾 Pre-Order Fresh Harvests</Text>
  <Text>Reserve perishable items before harvest day</Text>

  {preOrders.map(item => (
    <PreOrderCard
      key={item.id}
      image={item.image}
      countdownLabel={item.countdown_label}
      name={item.name}
      farmerName={item.farmer.name}
      preOrderCount={item.pre_order_count}
      stockLeft={`${item.stock_quantity} ${item.unit} left`}
      price={`Rp ${item.price.toLocaleString()}`}
      isOrganic={item.is_organic}
    />
  ))}
</View>
```

### Nearby Farmers Section

```typescript
// Farmers Near You with map
<View>
  <Text>Farmers Near You</Text>

  <MapView
    initialRegion={{
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }}
  >
    {nearbyFarmers.farmers.map(farmer => (
      <Marker
        key={farmer.id}
        coordinate={{
          latitude: farmer.latitude,
          longitude: farmer.longitude,
        }}
        title={farmer.name}
      />
    ))}
  </MapView>

  <View>
    <Text>{nearbyFarmers.count} Markets Open</Text>
    <Text>Within {nearbyFarmers.radius_km}km range</Text>
    <Button title="View Map" />
  </View>
</View>
```

### Fresh Today Section

```typescript
// Fresh Today product grid
<View>
  <Text>Fresh Today</Text>

  <ScrollView horizontal>
    {freshToday.map(product => (
      <ProductCard
        key={product.id}
        image={product.image}
        name={product.name}
        farmerName={product.farmer.name}
        price={`$${product.price}`}
        rating={product.rating}
        isOrganic={product.is_organic}
      />
    ))}
  </ScrollView>
</View>
```

## Performance Considerations

1. **Caching**: Consider caching the home data for 5-10 minutes
2. **Pagination**: Fresh Today returns 20 items - implement "See all" for more
3. **Location**: Request location permission carefully
4. **Images**: Use thumbnail URLs for better performance
5. **Lazy Loading**: Load sections progressively

## Related Endpoints

- `GET /api/v1/categories` - Full category list
- `GET /api/v1/products` - Browse all products
- `GET /api/v1/farmers/nearby` - More nearby farmers
- `GET /api/v1/products?harvest_date[gte]=today` - More pre-orders

## Error Handling

```typescript
try {
  const response = await fetch("/api/v1/home");
  const data = await response.json();

  if (data.status === "error") {
    // Handle error
    console.error(data.message);
  }
} catch (error) {
  console.error("Network error:", error);
}
```

## Testing

```bash
# Test basic home data
curl http://localhost:3000/api/v1/home

# Test with location (Jakarta coordinates)
curl "http://localhost:3000/api/v1/home?latitude=-6.2088&longitude=106.8456&radius=10"

# Test with different radius
curl "http://localhost:3000/api/v1/home?latitude=-6.2088&longitude=106.8456&radius=5"
```
