# Quick Start Guide - Deployment Checklist

## 🚀 Deploy Your Food Ordering System in 3 Steps

### Step 1: Set Up Supabase (15 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in details and create

2. **Run Database Migration**
   - Go to SQL Editor
   - Copy SQL from `SUPABASE_CONNECTION_GUIDE.md` (Step 3)
   - Click "Run"

3. **Create Storage Bucket**
   - Go to Storage
   - Create bucket named `food_images`
   - Make it public
   - Add storage policies (see guide)

4. **Get Your Credentials**
   - Go to Settings → API
   - Copy Project URL
   - Copy anon/public key

📖 **Detailed Guide**: See `SUPABASE_CONNECTION_GUIDE.md`

---

### Step 2: Configure Environment Variables (2 minutes)

1. **Create .env file**
   ```bash
   cp .env.example .env
   ```

2. **Add your Supabase credentials**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_ID=food-ordering-prod
   ```

3. **Test locally**
   ```bash
   npm install
   npm run dev
   ```

4. **Register first user** (becomes admin automatically)

---

### Step 3: Deploy to Vercel (10 minutes)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/food-ordering-system.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables (same as .env)
   - Click "Deploy"

3. **Configure Supabase for Production**
   - Go to Supabase → Authentication → URL Configuration
   - Add your Vercel URL to Site URL and Redirect URLs

4. **Test Your Deployment**
   - Visit your Vercel URL
   - Register a new user
   - Test admin panel at `/admin`

📖 **Detailed Guide**: See `VERCEL_DEPLOYMENT.md`

---

## ✅ Post-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database migration completed successfully
- [ ] Storage bucket created with correct policies
- [ ] Environment variables set in Vercel
- [ ] Application deployed and accessible
- [ ] First admin user registered
- [ ] Admin panel accessible at `/admin`
- [ ] Can add categories, restaurants, and food items
- [ ] Users can browse and place orders
- [ ] Images upload and display correctly

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SUPABASE_CONNECTION_GUIDE.md` | Complete Supabase setup instructions |
| `VERCEL_DEPLOYMENT.md` | Detailed Vercel deployment guide |
| `APPLICATION_SUMMARY.md` | Full application features and architecture |
| `SUPABASE_SETUP.md` | Technical Supabase integration details |
| `.env.example` | Environment variables template |

---

## 🆘 Need Help?

### Common Issues

**"Build failed on Vercel"**
- Check build logs in Vercel
- Test `npm run build` locally first
- Verify all dependencies are installed

**"Application loads but shows errors"**
- Check browser console for errors
- Verify environment variables in Vercel
- Make sure Supabase URL is added to allowed URLs

**"Can't login or register"**
- Check Supabase Authentication settings
- Verify Site URL includes your Vercel domain
- Check browser console for auth errors

**"Images not uploading"**
- Verify storage bucket is public
- Check storage policies are set correctly
- Make sure you're logged in as admin

### Get Support

- 📖 Read the detailed guides in this repository
- 🔍 Check browser console for error messages
- 📊 Review Supabase logs (Logs → API Logs)
- 🐛 Check Vercel deployment logs
- 💬 Supabase Discord: https://discord.supabase.com
- 💬 Vercel Discord: https://vercel.com/discord

---

## 🎉 Success!

Once deployed, your application will be live at:
- **Vercel URL**: `https://your-app-name.vercel.app`
- **Admin Panel**: `https://your-app-name.vercel.app/admin`

**First user registered becomes admin automatically!**

---

## 📈 Next Steps

1. **Add Sample Data**
   - Login as admin
   - Add categories, restaurants, and food items
   - Upload images for better presentation

2. **Customize Branding**
   - Update colors in `src/index.css`
   - Change app name in `index.html`
   - Add your logo

3. **Monitor Performance**
   - Enable Vercel Analytics
   - Monitor Supabase usage
   - Check error logs regularly

4. **Gather Feedback**
   - Share with test users
   - Collect feedback
   - Iterate and improve

---

## 🔒 Security Reminders

- ✅ Never commit `.env` file to Git
- ✅ Keep Supabase credentials secure
- ✅ Enable email verification in production
- ✅ Regularly review security policies
- ✅ Use strong passwords for admin accounts
- ✅ Monitor Supabase logs for suspicious activity

---

**Ready to deploy? Start with Step 1! 🚀**
