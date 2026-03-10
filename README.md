# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-a04i0mry03k1

# Food Ordering System

A complete food ordering platform similar to Swiggy/Zomato with separate client and admin interfaces, built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd food-ordering-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

## 📚 Documentation

- **[Deployment Quick Start](DEPLOYMENT_QUICKSTART.md)** - 3-step deployment guide
- **[Supabase Connection Guide](SUPABASE_CONNECTION_GUIDE.md)** - Complete Supabase setup
- **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** - Detailed deployment instructions
- **[Application Summary](APPLICATION_SUMMARY.md)** - Full features and architecture
- **[Supabase Setup](SUPABASE_SETUP.md)** - Technical integration details

## ✨ Features

### Client Side
- 🏠 Browse restaurants and food items
- 🔍 Search and filter functionality
- 🛒 Shopping cart management
- 📦 Order placement and tracking
- 👤 User profile management
- 📍 Delivery address management

### Admin Side
- 📊 Dashboard with statistics
- 🏪 Restaurant management (CRUD)
- 🍕 Food item management (CRUD)
- 📁 Category management (CRUD)
- 📋 Order management and status updates
- 👥 User management
- 🖼️ Image upload system

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/       # UI components
├── contexts/         # React contexts (Auth)
├── db/              # Supabase client and API
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── types/           # TypeScript types
└── lib/             # Utility functions
```

## 🔐 Authentication

- Username + password authentication
- First registered user becomes admin automatically
- Role-based access control (user/admin)
- Protected routes with route guards

## 🗄️ Database

7 tables with Row Level Security:
- profiles (users)
- categories
- restaurants
- food_items
- orders
- order_items
- addresses

## 🖼️ Image Upload

- Supabase Storage integration
- Automatic image compression
- Support for JPG, PNG, WEBP
- 1MB file size limit

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for detailed instructions.

## 📝 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ID=your_app_id
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Check the documentation files
- Review browser console for errors
- Check Supabase logs
- Open an issue on GitHub

## 🎉 Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Ready to get started? Follow the [Deployment Quick Start Guide](DEPLOYMENT_QUICKSTART.md)!** 🚀
