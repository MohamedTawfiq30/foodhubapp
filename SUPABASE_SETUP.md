# Food Ordering System - Supabase Setup Guide

## Overview
This application uses Supabase as the backend platform, providing:
- **PostgreSQL Database**: All data storage (users, restaurants, food items, orders)
- **Authentication**: User registration and login with username/password
- **Storage**: Image uploads for food items, categories, and restaurants
- **Real-time**: Order status updates

## Supabase Configuration

### Project Details
- **Project ID**: ygqrnofhpoxhkcjhfzot
- **Project URL**: https://ygqrnofhpoxhkcjhfzot.supabase.co
- **Storage Bucket**: app-a04i0mry03k1_food_images

### Database Schema

#### Tables
1. **profiles**
   - User information and roles
   - First user automatically becomes admin
   - Fields: id, email, username, full_name, phone, role, created_at, updated_at

2. **categories**
   - Food categories (Pizza, Burger, etc.)
   - Fields: id, name, description, image_url, created_at, updated_at

3. **restaurants**
   - Restaurant information
   - Fields: id, name, description, image_url, address, phone, rating, is_veg, is_active, created_at, updated_at

4. **food_items**
   - Menu items for each restaurant
   - Fields: id, name, description, price, image_url, category_id, restaurant_id, is_veg, is_available, created_at, updated_at

5. **orders**
   - Customer orders
   - Fields: id, user_id, total_amount, delivery_address, status, payment_method, created_at, updated_at

6. **order_items**
   - Line items for each order
   - Fields: id, order_id, food_item_id, quantity, price, created_at

7. **addresses**
   - User delivery addresses
   - Fields: id, user_id, label, street, city, state, zip_code, phone, is_default, created_at, updated_at

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following access patterns:

- **Public Read**: Categories, Restaurants, Food Items (for browsing)
- **Authenticated Users**: Can create orders, manage their own addresses
- **Admins**: Full access to all tables for management
- **Users**: Can view their own orders and profile

### Authentication

- **Method**: Username + Password (simulated as email with @miaoda.com domain)
- **Email Verification**: Disabled for easier testing
- **First User**: Automatically assigned admin role
- **JWT Tokens**: Managed by Supabase Auth

### Storage

- **Bucket Name**: app-a04i0mry03k1_food_images
- **Access**: Public read, Admin write
- **File Types**: Images (jpg, png, webp)
- **Max Size**: 1MB (with automatic compression)

## Frontend Integration

### Supabase Client
Located in: `src/db/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### API Functions
Located in: `src/db/api.ts`

All database operations are encapsulated in clean API functions:
- `getRestaurants()`, `createRestaurant()`, `updateRestaurant()`, `deleteRestaurant()`
- `getCategories()`, `createCategory()`, `deleteCategory()`
- `getFoodItems()`, `createFoodItem()`, `updateFoodItem()`, `deleteFoodItem()`
- `getOrders()`, `createOrder()`, `updateOrderStatus()`
- `getAddresses()`, `createAddress()`, `updateAddress()`, `deleteAddress()`
- `getDashboardStats()`

### Authentication Context
Located in: `src/contexts/AuthContext.tsx`

Provides:
- `signIn(username, password)` - User login
- `signUp(username, password, userData)` - User registration
- `signOut()` - User logout
- `user` - Current user object
- `profile` - User profile with role

## Sample Data

The database is pre-populated with:
- 8 Categories (Pizza, Burger, Sushi, Pasta, Salad, Dessert, Drinks, Indian)
- 5 Restaurants (various cuisines)
- 20 Food Items (distributed across restaurants and categories)

## Environment Variables

Required in `.env` file:
```
VITE_SUPABASE_URL=https://ygqrnofhpoxhkcjhfzot.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_ID=app-a04i0mry03k1
```

## Benefits of Using Supabase

1. **No Backend Code Required**: All API logic handled by Supabase
2. **Built-in Authentication**: Secure user management out of the box
3. **Real-time Capabilities**: Can add live order tracking easily
4. **Automatic API Generation**: REST and GraphQL APIs auto-generated
5. **File Storage**: Integrated CDN for images
6. **Row Level Security**: Database-level security policies
7. **Easy Scaling**: Managed infrastructure
8. **Developer Experience**: Great dashboard and tools

## Next Steps

To use this application:
1. Ensure `.env` file has correct Supabase credentials
2. Run `npm run dev` to start the frontend
3. Register a new user (first user becomes admin)
4. Admin can access `/admin` routes to manage the system
5. Regular users can browse, order, and track deliveries
