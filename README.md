# TimeLine - Appointment Booking & Management System

A modern, professional SaaS platform for businesses to manage appointments, bookings, and customer scheduling. Built with React, TypeScript, and Supabase.

## 🚀 Features

### For Businesses
- **Professional Dashboard** - Premium UI with real-time statistics
- **Appointment Management** - View, create, and manage all bookings
- **QR Code Generation** - Generate QR codes for easy customer access
- **Time Slot Configuration** - Flexible scheduling with custom business hours
- **Customer Database** - Track all customer appointments and history
- **Multi-status Tracking** - Confirmed, completed, cancelled, no-show
- **Rate Limiting** - Built-in security to prevent abuse
- **Dark Mode** - Full theme support

### For Customers
- **Easy Booking** - Simple 3-step booking process
- **Real-time Availability** - See available time slots instantly
- **Mobile-Friendly** - Responsive design for all devices
- **Appointment Status** - Track booking status
- **QR Code Scanning** - Quick access via business QR codes

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Framework:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([Sign up here](https://supabase.com))
- Git

## 🏃 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aliihsaad/timeline-booking.git
cd timeline-booking
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
```

**To get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or select existing)
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Set Up Database

The database schema is in `supabase/migrations/`. Run migrations in your Supabase project:

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref your-project-id`
3. Push migrations: `supabase db push`

**Or manually run the SQL from the first migration file** in your Supabase SQL Editor.

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running.

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🚀 Deployment

### Recommended: Vercel

1. Push your code to GitHub
2. Import your repo on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Alternative: Netlify, Cloudflare Pages, or any static host

The built `dist/` folder can be deployed to any static hosting service.

## 📱 Usage

### For Business Owners

1. **Sign Up:** Visit `/business/login` and create an account
2. **Setup Business:** Complete your business profile
3. **Configure Hours:** Set your business hours and time slots
4. **Share Your Link:** Get your unique booking page `/b/your-business-id`
5. **Download QR Code:** Generate and share QR codes
6. **Manage Bookings:** View and manage appointments from dashboard

### For Customers

1. **Visit Business Page:** Scan QR code or visit booking link
2. **Select Date & Time:** Choose from available slots
3. **Enter Details:** Provide contact information
4. **Confirm:** Booking confirmed instantly

## 🗂️ Project Structure

```
timeline-booking/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── pages/          # Route pages
│   ├── lib/            # Business logic & services
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Supabase integration
│   └── App.tsx         # Main app component
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
└── ...config files
```

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Rate limiting on appointment creation
- Secure error handling (no sensitive data exposure)
- Environment variable protection
- Input validation with Zod

## 🐛 Known Issues & Roadmap

See [GitHub Issues](https://github.com/aliihsaad/timeline-booking/issues) for current bugs and feature requests.

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the owner for collaboration opportunities.

## 💬 Support

For support or questions, please open an issue on GitHub.

---

**Built with ❤️ using React + Supabase**
