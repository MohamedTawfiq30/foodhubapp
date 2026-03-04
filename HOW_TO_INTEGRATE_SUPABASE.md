# How to Integrate Your Supabase Account - Simple Guide

Follow these steps to connect your own Supabase account to this application.

---

## Step 1: Create a Supabase Project (5 minutes)

### 1.1 Sign Up / Log In
1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign In"**
3. Sign up with GitHub, Google, or Email

### 1.2 Create New Project
1. Click **"New Project"** button
2. Fill in the form:
   - **Organization**: Select or create one
   - **Name**: `food-ordering` (or any name you prefer)
   - **Database Password**: Create a strong password
     - ⚠️ **IMPORTANT**: Save this password somewhere safe!
   - **Region**: Choose the closest region to your users
     - Example: `East US (North Virginia)` for US users
   - **Pricing Plan**: Select **Free** (sufficient for testing)
3. Click **"Create new project"**
4. Wait 2-3 minutes while Supabase sets up your project

---

## Step 2: Get Your Project Credentials (2 minutes)

### 2.1 Find Your API Settings
1. In your Supabase project dashboard, look at the left sidebar
2. Click on **⚙️ Settings** (at the bottom)
3. Click on **API** in the settings menu

### 2.2 Copy Your Credentials
You'll see two important values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this entire URL.

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```
Copy this entire key (it's very long, make sure you get all of it).

⚠️ **Keep these safe!** You'll need them in the next step.

---

## Step 3: Set Up Your Database (10 minutes)

### 3.1 Open SQL Editor
1. In the left sidebar, click on **🗄️ SQL Editor**
2. Click **"New query"** button (top right)

### 3.2 Copy and Paste the Migration SQL

Copy the entire SQL code below and paste it into the SQL Editor:

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

### 3.3 Run the SQL
1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait a few seconds
3. You should see: **"Success. No rows returned"**

✅ If you see this, your database is set up correctly!

❌ If you see an error, make sure you copied the entire SQL code.

---

## Step 4: Create Storage Bucket for Images (5 minutes)

### 4.1 Navigate to Storage
1. In the left sidebar, click on **📦 Storage**
2. Click **"New bucket"** button

### 4.2 Create the Bucket
Fill in the form:
- **Name**: `food_images`
- **Public bucket**: ✅ **Check this box** (important!)
- **File size limit**: `1048576` (1 MB)
- **Allowed MIME types**: Leave empty or add: `image/jpeg,image/png,image/webp`

Click **"Create bucket"**

### 4.3 Set Storage Policies
1. Click on your `food_images` bucket
2. Click on **"Policies"** tab
3. Click **"New policy"**

**Create 3 policies:**

**Policy 1: Public Read**
- Click **"For full customization"**
- Policy name: `Public Access`
- Target roles: `public`
- Policy command: `SELECT`
- Policy definition:
```sql
bucket_id = 'food_images'
```
Click **"Review"** then **"Save policy"**

**Policy 2: Authenticated Upload**
- Click **"New policy"** again
- Policy name: `Authenticated Upload`
- Target roles: `authenticated`
- Policy command: `INSERT`
- Policy definition:
```sql
bucket_id = 'food_images'
```
Click **"Review"** then **"Save policy"**

**Policy 3: Authenticated Delete**
- Click **"New policy"** again
- Policy name: `Authenticated Delete`
- Target roles: `authenticated`
- Policy command: `DELETE`
- Policy definition:
```sql
bucket_id = 'food_images'
```
Click **"Review"** then **"Save policy"**

---

## Step 5: Disable Email Verification (Optional but Recommended)

This makes testing easier - users can register and login immediately.

1. In the left sidebar, click on **🔐 Authentication**
2. Click on **"Providers"**
3. Find **"Email"** and click on it
4. **Uncheck** the box that says **"Confirm email"**
5. Click **"Save"**

---

## Step 6: Update Your Local Environment (3 minutes)

### 6.1 Create .env File
In your project folder, create a file named `.env`:

```bash
# On Mac/Linux
touch .env

# On Windows
type nul > .env
```

### 6.2 Add Your Credentials
Open the `.env` file and add these lines:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ID=food-ordering-app
```

**Replace:**
- `https://xxxxxxxxxxxxx.supabase.co` with YOUR Project URL from Step 2
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with YOUR anon key from Step 2
- `food-ordering-app` can stay as is, or change to any unique ID

⚠️ **Important**: Make sure there are NO spaces around the `=` sign!

### 6.3 Save the File
Save and close the `.env` file.

---

## Step 7: Update Storage Bucket Name in Code (2 minutes)

### 7.1 Open the Upload Hook File
Open this file: `src/hooks/use-supabase-upload.ts`

### 7.2 Find the Bucket Name
Look for this line (around line 60-70):
```typescript
bucketName: 'app-a04i0mry03k1_food_images'
```

### 7.3 Change It
Change it to:
```typescript
bucketName: 'food_images'
```

### 7.4 Save the File

---

## Step 8: Test Your Connection (5 minutes)

### 8.1 Install Dependencies
```bash
npm install
```

### 8.2 Start the Development Server
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 8.3 Open in Browser
Open your browser and go to: **http://localhost:5173**

### 8.4 Register Your First User (Admin)
1. Click **"Login"** in the top right
2. Click **"Sign Up"** tab
3. Enter:
   - **Username**: `admin` (or any username you want)
   - **Password**: Create a strong password
4. Click **"Sign Up"**

✅ **Success!** You should be logged in automatically.

### 8.5 Verify Admin Access
1. Look at the top navigation bar
2. You should see an **"Admin"** link
3. Click on it
4. You should see the admin dashboard with stats

🎉 **Congratulations!** Your Supabase is connected and working!

---

## Step 9: Add Sample Data (Optional - 5 minutes)

To test the app with some data:

### 9.1 Go Back to Supabase SQL Editor
1. Open Supabase dashboard
2. Go to **SQL Editor**
3. Click **"New query"**

### 9.2 Add Sample Categories
```sql
INSERT INTO categories (name, description, image_url) VALUES
  ('Pizza', 'Delicious pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
  ('Burger', 'Juicy burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
  ('Sushi', 'Fresh sushi', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'),
  ('Pasta', 'Italian pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'),
  ('Salad', 'Healthy salads', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400');
```

Click **"Run"**

### 9.3 Add Sample Restaurants
```sql
INSERT INTO restaurants (name, description, image_url, address, phone, rating, is_veg, is_active) VALUES
  ('Pizza Palace', 'Best pizzas in town', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', '123 Main St', '555-0101', 4.5, false, true),
  ('Burger House', 'Gourmet burgers', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', '456 Oak Ave', '555-0102', 4.3, false, true),
  ('Green Garden', 'Vegetarian delights', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', '321 Elm St', '555-0104', 4.6, true, true);
```

Click **"Run"**

### 9.4 Refresh Your App
Go back to your browser and refresh the page. You should now see categories and restaurants!

---

## Troubleshooting

### ❌ "Invalid API key" Error
**Problem**: Wrong credentials in `.env` file

**Solution**:
1. Double-check your `.env` file
2. Make sure you copied the FULL anon key (it's very long)
3. Make sure there are no extra spaces
4. Restart your dev server: Stop it (`Ctrl+C`) and run `npm run dev` again

### ❌ "relation does not exist" Error
**Problem**: Database tables not created

**Solution**:
1. Go back to Step 3
2. Make sure you copied the ENTIRE SQL code
3. Run it again in SQL Editor
4. Check for any error messages

### ❌ Can't Upload Images
**Problem**: Storage bucket not configured correctly

**Solution**:
1. Go to Supabase → Storage
2. Make sure `food_images` bucket exists
3. Make sure it's marked as **Public**
4. Check that all 3 policies are created
5. Verify bucket name in code matches (Step 7)

### ❌ Can't Login/Register
**Problem**: Authentication not configured

**Solution**:
1. Check browser console for errors (F12)
2. Verify `.env` credentials are correct
3. Make sure email verification is disabled (Step 5)
4. Check Supabase → Authentication → Users to see if user was created

---

## Next Steps

✅ **Your Supabase is now connected!**

**What you can do now:**
1. ✅ Login as admin
2. ✅ Add categories, restaurants, and food items
3. ✅ Upload images
4. ✅ Create test orders
5. ✅ Manage everything from admin panel

**Ready to deploy?**
- See `VERCEL_DEPLOYMENT.md` for deployment instructions

---

## Need More Help?

- 📖 **Detailed Guide**: See `SUPABASE_CONNECTION_GUIDE.md`
- 🚀 **Deployment**: See `VERCEL_DEPLOYMENT.md`
- 📚 **Features**: See `APPLICATION_SUMMARY.md`
- 💬 **Supabase Docs**: https://supabase.com/docs
- 💬 **Supabase Discord**: https://discord.supabase.com

---

**Happy coding! 🎉**
