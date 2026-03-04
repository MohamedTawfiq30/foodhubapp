# Connecting Your Own Supabase Account - Step by Step Guide

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed locally
- Git installed

---

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `food-ordering-system` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

---

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)
3. Keep these safe - you'll need them in Step 5

---

## Step 3: Set Up the Database Schema

### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the contents of the migration file below
4. Click **"Run"** to execute

**Migration SQL:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create order_status enum
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  address TEXT,
  phone TEXT,
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_veg BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create food_items table
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  is_veg BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_address JSONB NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method TEXT DEFAULT 'COD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_food_items_category ON food_items(category_id);
CREATE INDEX idx_food_items_restaurant ON food_items(restaurant_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin(auth.uid()));

-- Restaurants policies
CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update restaurants"
  ON restaurants FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete restaurants"
  ON restaurants FOR DELETE
  USING (is_admin(auth.uid()));

-- Food items policies
CREATE POLICY "Food items are viewable by everyone"
  ON food_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert food items"
  ON food_items FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update food items"
  ON food_items FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete food items"
  ON food_items FOR DELETE
  USING (is_admin(auth.uid()));

-- Addresses policies
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT
  USING (is_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (is_admin(auth.uid()));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Insert new profile
  INSERT INTO profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1), -- Extract username from email
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users with profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. If successful, you'll see "Success. No rows returned"

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 4: Set Up Storage Bucket for Images

1. In your Supabase dashboard, go to **Storage**
2. Click **"New bucket"**
3. Configure the bucket:
   - **Name**: `food_images`
   - **Public bucket**: ✅ Check this (images need to be publicly accessible)
   - **File size limit**: 1 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Click **"Create bucket"**

### Set Storage Policies

1. Click on the `food_images` bucket
2. Go to **Policies** tab
3. Click **"New policy"**

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'food_images');
```

**Policy 2: Authenticated Upload (for admins)**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'food_images' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Authenticated Delete**
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'food_images' 
  AND auth.role() = 'authenticated'
);
```

---

## Step 5: Configure Your Local Environment

1. In your project root, create a `.env` file:

```bash
# Create .env file
touch .env
```

2. Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ID=your-app-id
```

Replace:
- `your-project-ref` with your actual project reference
- `your-anon-key-here` with your anon/public key from Step 2
- `your-app-id` with a unique identifier (e.g., `food-ordering-prod`)

3. **Important**: Make sure `.env` is in your `.gitignore` file

---

## Step 6: Update Storage Bucket Name in Code

Since you created a bucket named `food_images`, you need to update the bucket name in the code:

1. Open `src/hooks/use-supabase-upload.ts`
2. Find any references to the old bucket name
3. Update to `food_images`

Or you can name your bucket `app-a04i0mry03k1_food_images` to match the existing code.

---

## Step 7: Disable Email Verification (Optional)

For easier testing, you can disable email verification:

1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck **"Confirm email"**
3. Click **"Save"**

This allows users to register and login immediately without email confirmation.

---

## Step 8: Test Your Connection

1. Start your development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:5173`

3. Try to register a new user:
   - Go to `/login`
   - Click "Sign Up"
   - Enter username and password
   - Click "Sign Up"

4. If successful:
   - You should be logged in automatically
   - This first user will be an **admin**
   - You can access `/admin` routes

5. Check your Supabase dashboard:
   - Go to **Authentication** → **Users**
   - You should see your new user
   - Go to **Table Editor** → **profiles**
   - You should see a profile with `role = 'admin'`

---

## Step 9: Add Sample Data (Optional)

To populate your database with sample data for testing:

1. Go to **SQL Editor** in Supabase
2. Run this query to add sample categories:

```sql
INSERT INTO categories (name, description, image_url) VALUES
  ('Pizza', 'Delicious pizzas with various toppings', 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
  ('Burger', 'Juicy burgers with fresh ingredients', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
  ('Sushi', 'Fresh and authentic Japanese sushi', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
  ('Pasta', 'Italian pasta dishes', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'),
  ('Salad', 'Fresh and healthy salads', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
  ('Dessert', 'Sweet treats and desserts', 'https://images.unsplash.com/photo-1551024506-0bccd828d307'),
  ('Drinks', 'Refreshing beverages', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22'),
  ('Indian', 'Authentic Indian cuisine', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe');
```

3. Add sample restaurants:

```sql
INSERT INTO restaurants (name, description, image_url, address, phone, rating, is_veg, is_active) VALUES
  ('Pizza Palace', 'Best pizzas in town', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', '123 Main St, City', '555-0101', 4.5, false, true),
  ('Burger House', 'Gourmet burgers', 'https://images.unsplash.com/photo-1550547660-d9450f859349', '456 Oak Ave, City', '555-0102', 4.3, false, true),
  ('Sushi Master', 'Authentic Japanese cuisine', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', '789 Pine Rd, City', '555-0103', 4.8, false, true),
  ('Green Garden', 'Vegetarian delights', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', '321 Elm St, City', '555-0104', 4.6, true, true),
  ('Spice Route', 'Indian flavors', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe', '654 Maple Dr, City', '555-0105', 4.7, false, true);
```

---

## Troubleshooting

### Issue: "Invalid API key"
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

### Issue: "relation does not exist"
- Make sure you ran the complete migration SQL in Step 3
- Check the SQL Editor for any error messages
- Verify tables exist in **Table Editor**

### Issue: "Row Level Security policy violation"
- Make sure you ran all the RLS policies in the migration
- Check that the `is_admin` function was created
- Verify your user has the correct role in the `profiles` table

### Issue: "Storage bucket not found"
- Make sure you created the `food_images` bucket in Step 4
- Verify the bucket name matches in your code
- Check that the bucket is set to **public**

### Issue: "Cannot upload images"
- Verify storage policies are set correctly
- Make sure you're logged in as an admin
- Check browser console for specific error messages

---

## Next Steps

Once your Supabase connection is working:
1. ✅ Database is set up and connected
2. ✅ First admin user is created
3. ✅ Storage bucket is configured
4. 🚀 Ready to deploy to Vercel (see VERCEL_DEPLOYMENT.md)

---

## Security Notes

- **Never commit `.env` file** to Git
- Keep your database password secure
- Use environment variables for all sensitive data
- Enable RLS on all tables (already done in migration)
- Regularly review your Supabase security settings
- Consider enabling email verification in production

---

## Support

If you encounter issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Review API logs: **Logs** → **API Logs**
3. Check browser console for frontend errors
4. Verify network requests in browser DevTools
5. Consult Supabase documentation: https://supabase.com/docs
