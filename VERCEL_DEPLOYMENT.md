# Deploying to Vercel - Complete Guide

## Prerequisites

Before deploying, make sure you have:
- ✅ Supabase project set up and connected (see SUPABASE_CONNECTION_GUIDE.md)
- ✅ Application tested locally and working
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Vercel account (sign up at https://vercel.com)

---

## Step 1: Prepare Your Application for Deployment

### 1.1 Create Production Build Configuration

The application is already configured for production builds. Verify `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
```

### 1.2 Verify .gitignore

Make sure these are in your `.gitignore`:

```
# dependencies
node_modules/

# production
dist/
build/

# environment variables
.env
.env.local
.env.production

# misc
.DS_Store
*.log
```

### 1.3 Update package.json Scripts

Your `package.json` should have these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "biome check --write ."
  }
}
```

---

## Step 2: Push Your Code to Git Repository

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Food Ordering System"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `food-ordering-system`
   - **Visibility**: Private (recommended) or Public
   - **Don't** initialize with README (you already have one)
3. Click **"Create repository"**

### 2.3 Push to GitHub

```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/food-ordering-system.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. From Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `food-ordering-system` repository
3. Click **"Import"**

### 3.3 Configure Project Settings

**Framework Preset**: Vite (should be auto-detected)

**Root Directory**: `./` (leave as default)

**Build Command**: 
```bash
npm run build
```

**Output Directory**: 
```bash
dist
```

**Install Command**: 
```bash
npm install
```

### 3.4 Add Environment Variables

This is **CRITICAL** - your app won't work without these!

Click **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |
| `VITE_APP_ID` | `food-ordering-prod` | Production, Preview, Development |

**Where to find these values:**
- Go to your Supabase project
- Navigate to **Settings** → **API**
- Copy **Project URL** and **anon/public key**

**Important Notes:**
- Make sure to select all three environments (Production, Preview, Development)
- Double-check there are no extra spaces
- The keys must start with `VITE_` to be accessible in the frontend

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll see a success screen with your deployment URL

---

## Step 4: Configure Supabase for Production

### 4.1 Add Vercel Domain to Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel deployment URL to **Site URL**:
   ```
   https://your-app-name.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-app-name.vercel.app/**
   ```
5. Click **"Save"**

### 4.2 Update Storage Bucket CORS (if needed)

If you have CORS issues with image uploads:

1. Go to **Storage** → **Policies**
2. Make sure your bucket allows public access
3. Check CORS settings in **Storage** → **Settings**

---

## Step 5: Test Your Deployment

### 5.1 Basic Functionality Test

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test the following:
   - ✅ Home page loads
   - ✅ Can view restaurants
   - ✅ Can view food items
   - ✅ Images load correctly

### 5.2 Authentication Test

1. Go to `/login`
2. Register a new user
3. Verify:
   - ✅ Registration works
   - ✅ Login works
   - ✅ User is redirected to home page
   - ✅ First user becomes admin

### 5.3 Admin Panel Test

1. Login as admin (first registered user)
2. Navigate to `/admin`
3. Test:
   - ✅ Dashboard loads with stats
   - ✅ Can view restaurants
   - ✅ Can add new category
   - ✅ Can upload images

### 5.4 Order Flow Test

1. Login as a regular user
2. Test complete order flow:
   - ✅ Add items to cart
   - ✅ Proceed to checkout
   - ✅ Enter delivery address
   - ✅ Place order
   - ✅ View order in order history
   - ✅ Track order status

---

## Step 6: Set Up Custom Domain (Optional)

### 6.1 Add Custom Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name (e.g., `foodorder.com`)
4. Click **"Add"**

### 6.2 Configure DNS

Vercel will provide DNS records. Add these to your domain registrar:

**For root domain (foodorder.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6.3 Update Supabase URLs

1. Go to Supabase **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain
3. Update **Redirect URLs** to include your custom domain

---

## Step 7: Set Up Continuous Deployment

Vercel automatically sets up continuous deployment. Every time you push to your main branch, Vercel will:

1. Detect the push
2. Build your application
3. Deploy the new version
4. Make it live automatically

### To Deploy Updates:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically deploy within 2-3 minutes.

---

## Step 8: Monitor Your Deployment

### 8.1 Vercel Analytics

1. In your Vercel project, go to **Analytics**
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### 8.2 Vercel Logs

1. Go to **Deployments**
2. Click on any deployment
3. View **Build Logs** and **Function Logs**

### 8.3 Supabase Monitoring

1. In Supabase, go to **Logs**
2. Monitor:
   - **API Logs**: API requests and responses
   - **Postgres Logs**: Database queries
   - **Auth Logs**: Authentication events

---

## Troubleshooting

### Issue: "Build Failed"

**Check build logs:**
1. Go to Vercel deployment page
2. Click **"View Build Logs"**
3. Look for error messages

**Common causes:**
- TypeScript errors
- Missing dependencies
- Environment variables not set

**Solution:**
```bash
# Test build locally first
npm run build

# Fix any errors, then push again
git add .
git commit -m "Fix build errors"
git push origin main
```

### Issue: "Application loads but shows errors"

**Check browser console:**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages

**Common causes:**
- Environment variables not set correctly
- Supabase URL not configured
- CORS issues

**Solution:**
1. Verify environment variables in Vercel
2. Check Supabase URL configuration
3. Add Vercel domain to Supabase allowed URLs

### Issue: "Images not loading"

**Possible causes:**
- Storage bucket not public
- CORS not configured
- Wrong bucket name

**Solution:**
1. Go to Supabase **Storage**
2. Make sure bucket is **public**
3. Check storage policies
4. Verify bucket name in code matches Supabase

### Issue: "Authentication not working"

**Check:**
1. Supabase **Site URL** includes Vercel domain
2. **Redirect URLs** includes Vercel domain
3. Environment variables are correct

**Solution:**
1. Update Supabase URL configuration
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy after changes

### Issue: "Database queries failing"

**Check Supabase logs:**
1. Go to **Logs** → **Postgres Logs**
2. Look for error messages

**Common causes:**
- RLS policies blocking queries
- Missing tables or columns
- Wrong table names

**Solution:**
1. Verify all migrations ran successfully
2. Check RLS policies
3. Test queries in Supabase SQL Editor

---

## Performance Optimization

### 1. Enable Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

Add to `src/main.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

// Add to your app
<SpeedInsights />
```

### 2. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Add to your app
<Analytics />
```

### 3. Optimize Images

- Use WebP format
- Compress images before upload
- Use Supabase image transformations

### 4. Enable Caching

Vercel automatically caches static assets. For API responses, consider:
- Using Supabase caching
- Implementing client-side caching with React Query

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use Vercel environment variables
- ✅ Rotate keys regularly

### 2. Supabase Security
- ✅ Enable RLS on all tables
- ✅ Review security policies regularly
- ✅ Use strong database password
- ✅ Enable email verification in production

### 3. Vercel Security
- ✅ Enable password protection for preview deployments
- ✅ Use custom domain with HTTPS
- ✅ Enable DDoS protection

### 4. Application Security
- ✅ Validate all user inputs
- ✅ Sanitize data before display
- ✅ Implement rate limiting
- ✅ Use HTTPS only

---

## Scaling Considerations

### When to Upgrade Supabase Plan

Free tier limits:
- 500 MB database space
- 1 GB file storage
- 50,000 monthly active users

Upgrade when you approach these limits.

### When to Upgrade Vercel Plan

Free tier includes:
- 100 GB bandwidth per month
- Unlimited deployments
- Automatic HTTPS

Upgrade for:
- Custom domains on team projects
- Advanced analytics
- Priority support

---

## Backup and Recovery

### 1. Database Backups

Supabase automatically backs up your database daily.

**Manual backup:**
1. Go to **Database** → **Backups**
2. Click **"Create backup"**
3. Download backup file

### 2. Code Backups

Your code is backed up in Git:
- GitHub repository
- Vercel deployment history

### 3. Storage Backups

Consider backing up your storage bucket:
1. Use Supabase CLI to download files
2. Store in separate cloud storage

---

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All pages are accessible
- [ ] Authentication works
- [ ] Admin panel accessible
- [ ] Images load properly
- [ ] Orders can be placed
- [ ] Database queries work
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security policies reviewed
- [ ] Performance optimized
- [ ] Documentation updated

---

## Support and Resources

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/frameworks/vite

### Supabase Documentation
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth

### Community Support
- Vercel Discord: https://vercel.com/discord
- Supabase Discord: https://discord.supabase.com

---

## Congratulations! 🎉

Your Food Ordering System is now live and accessible to users worldwide!

**Your deployment URL**: `https://your-app-name.vercel.app`

**Next steps:**
1. Share the URL with users
2. Monitor performance and errors
3. Gather user feedback
4. Iterate and improve

Happy deploying! 🚀
