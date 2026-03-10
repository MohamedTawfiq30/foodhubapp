# Analytics Dashboard Documentation

## Overview

The Analytics Dashboard provides comprehensive insights into the food ordering system's business performance. It includes visualizations and metrics for food items, restaurants, revenue trends, order status distribution, and category performance.

## Features

### 1. Overview Tab
- **Revenue Trend Chart**: Line chart showing revenue and order count over the last 30 days
- **Order Status Distribution**: Pie chart displaying the percentage breakdown of orders by status (pending, preparing, out for delivery, delivered, cancelled)
- **Top Categories**: List of top 5 categories by revenue with order counts

### 2. Food Items Tab
- **Most Ordered Food Items**: Bar chart and detailed list showing:
  - Total orders per food item
  - Total quantity sold
  - Total revenue generated
  - Restaurant name
  - Food item image
  - Ranking (1-10)

### 3. Restaurants Tab
- **Most Ordered Restaurants**: Bar chart and detailed list showing:
  - Total revenue per restaurant
  - Total number of orders
  - Average order value
  - Restaurant image
  - Ranking (1-10)

### 4. Categories Tab
- **Category Performance**: Dual-axis bar chart showing:
  - Total orders per category
  - Total revenue per category
  - Grid view with rankings

## Database Functions

The analytics dashboard uses the following PostgreSQL functions:

### 1. `get_most_ordered_food_items(item_limit INT)`
Returns the top N food items by order count and revenue.

**Returns:**
- `id`: Food item UUID
- `name`: Food item name
- `image_url`: Food item image URL
- `total_orders`: Number of distinct orders
- `total_quantity`: Total quantity sold
- `total_revenue`: Total revenue generated
- `restaurant_name`: Associated restaurant name

### 2. `get_most_ordered_restaurants(restaurant_limit INT)`
Returns the top N restaurants by order volume and revenue.

**Returns:**
- `id`: Restaurant UUID
- `name`: Restaurant name
- `image_url`: Restaurant image URL
- `total_orders`: Number of orders
- `total_revenue`: Total revenue
- `average_order_value`: Average order amount

### 3. `get_revenue_by_date(days_back INT)`
Returns daily revenue and order count for the specified number of days.

**Returns:**
- `date`: Date
- `revenue`: Total revenue for that date
- `order_count`: Number of orders for that date

### 4. `get_order_status_distribution()`
Returns the distribution of orders by status with percentages.

**Returns:**
- `status`: Order status
- `count`: Number of orders with this status
- `percentage`: Percentage of total orders

### 5. `get_category_analytics()`
Returns analytics for all categories.

**Returns:**
- `id`: Category UUID
- `name`: Category name
- `total_orders`: Number of orders containing items from this category
- `total_revenue`: Total revenue from this category

## API Functions

Located in `/src/db/api.ts`:

```typescript
// Get most ordered food items (default: top 10)
getMostOrderedFoodItems(limit?: number): Promise<FoodItemAnalytics[]>

// Get most ordered restaurants (default: top 10)
getMostOrderedRestaurants(limit?: number): Promise<RestaurantAnalytics[]>

// Get revenue by date (default: last 30 days)
getRevenueByDate(days?: number): Promise<RevenueByDate[]>

// Get order status distribution
getOrderStatusDistribution(): Promise<OrderStatusDistribution[]>

// Get category analytics
getCategoryAnalytics(): Promise<CategoryAnalytics[]>
```

## Type Definitions

Located in `/src/types/types.ts`:

```typescript
interface FoodItemAnalytics {
  id: string;
  name: string;
  image_url: string | null;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
  restaurant_name: string;
}

interface RestaurantAnalytics {
  id: string;
  name: string;
  image_url: string | null;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

interface RevenueByDate {
  date: string;
  revenue: number;
  order_count: number;
}

interface OrderStatusDistribution {
  status: OrderStatus;
  count: number;
  percentage: number;
}

interface CategoryAnalytics {
  id: string;
  name: string;
  total_orders: number;
  total_revenue: number;
}
```

## Charts and Visualizations

The dashboard uses **Recharts** library for data visualization:

- **LineChart**: Revenue trend over time
- **PieChart**: Order status distribution
- **BarChart**: Food items, restaurants, and category performance

### Chart Features:
- Responsive design (adapts to screen size)
- Custom tooltips with formatted currency (INR)
- Color-coded data series
- Interactive legends
- Grid lines for better readability

## Currency Formatting

All monetary values are displayed in Indian Rupees (INR) using:
- `formatCurrency()`: Standard format (₹1,234.56)
- `formatCurrencyCompact()`: Compact format for large numbers (₹1.2L, ₹1.5Cr)

## Access Control

The Analytics Dashboard is only accessible to admin users:
- Route: `/admin/analytics`
- Protected: Yes
- Admin Only: Yes

## Navigation

The Analytics page is accessible from the Admin Layout sidebar:
- Icon: TrendingUp (📈)
- Position: Second item after Dashboard

## Performance Considerations

1. **Data Caching**: Analytics data is loaded once on page mount
2. **Efficient Queries**: Database functions use aggregations and proper indexing
3. **Error Handling**: All API calls have error handling with fallback to empty arrays
4. **Loading States**: Skeleton loaders shown while data is being fetched

## Future Enhancements

Potential improvements for the analytics dashboard:

1. **Date Range Selector**: Allow users to select custom date ranges
2. **Export Functionality**: Export analytics data to CSV/PDF
3. **Real-time Updates**: Use Supabase Realtime for live analytics
4. **Comparison Views**: Compare current period with previous period
5. **Customer Analytics**: Add customer lifetime value, retention rates
6. **Peak Hours Analysis**: Show busiest ordering times
7. **Geographic Analytics**: Revenue by location/area
8. **Predictive Analytics**: Forecast future trends using historical data

## Troubleshooting

### No Data Showing
- Ensure there are orders in the database
- Check that the database functions are created correctly
- Verify RLS policies allow admin access to analytics data

### Charts Not Rendering
- Check browser console for errors
- Ensure recharts library is installed: `pnpm add recharts`
- Verify data format matches expected structure

### Slow Performance
- Check database query performance
- Consider adding indexes on frequently queried columns
- Implement pagination for large datasets

## Testing

To test the analytics dashboard:

1. Create sample data:
   - Add restaurants
   - Add food items
   - Create orders with various statuses
   - Ensure orders span multiple days

2. Verify each tab:
   - Overview: Check revenue trend and status distribution
   - Food Items: Verify top items are correctly ranked
   - Restaurants: Verify revenue calculations
   - Categories: Verify category totals

3. Test edge cases:
   - Empty database
   - Single order
   - All orders cancelled
   - Large datasets (1000+ orders)
