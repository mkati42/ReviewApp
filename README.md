# ReviewBoard - Mini Deal/Issue Review System

🚀 **A comprehensive B2B SaaS-style review system built with Next.js 15, TypeScript, and modern web technologies.**

## 📋 Project Overview

ReviewBoard is a mini deal/issue review system that simulates real-world B2B SaaS workflows for reviewing, scoring, and approving/rejecting submissions like startup pitch decks, funding requests, or compliance cases.

### ✨ Key Features

- **🔐 Multi-Provider Authentication** - Email/Password, GitHub, and Google OAuth
- **📊 Risk Scoring System** - Automated calculation based on cost, duration, project type, and technical complexity
- **👥 Role-Based Access Control** - User and Admin roles with different permissions
- **📝 Comprehensive Audit Logging** - Track all changes with detailed history
- **🎛️ Admin Panel** - Complete application management interface
- **🔍 Advanced Filtering** - Filter by status, risk score, project type, and search
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🛡️ Type-Safe API** - Full TypeScript integration with proper error handling

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js (Auth.js)
- **UI Components**: shadcn/ui, Radix UI
- **Validation**: Zod (built into forms)

### API Endpoints
- `GET/POST /api/items` - CRUD operations with filtering
- `GET/POST /api/score/[id]` - Risk score calculation and retrieval
- `GET/PUT/DELETE /api/items/[id]` - Individual item management
- `POST /api/auth/[...nextauth]` - Authentication endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/mkati42/ReviewApp.git
cd ReviewApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# GitHub OAuth (Optional)
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"

# Google OAuth (Optional)
GOOGLE_ID="your-google-client-id.googleusercontent.com"
GOOGLE_SECRET="your-google-client-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Core Models
- **User** - Authentication and role management
- **Application** - Project submissions with risk scoring
- **AuditLog** - Complete change tracking
- **Account/Session** - NextAuth session management

### Key Enums
- `ApplicationStatus`: PENDING, APPROVED, REJECTED
- `ProjectType`: WEB_DEVELOPMENT, MOBILE_APP, DATA_ANALYSIS, etc.
- `Role`: USER, ADMIN

## 🔑 Authentication Setup

### Email/Password
Works out of the box - users can register and login with email/password.

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Add `GITHUB_ID` and `GITHUB_SECRET` to your `.env.local`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add `GOOGLE_ID` and `GOOGLE_SECRET` to your `.env.local`

## 👤 User Roles & Permissions

### User Role
- Create new applications
- View/edit their own applications
- View risk scores and audit logs
- Update profile information

### Admin Role
- View all applications from all users
- Change application status (Approve/Reject)
- Add review notes
- Access admin dashboard with statistics
- Full audit trail visibility

## 🎯 Risk Scoring Algorithm

The system automatically calculates risk scores (0-100) based on:

- **Cost Factor (0-40 points)**
  - < $5,000: 5 points
  - $5,000-$20,000: 15 points
  - $20,000-$50,000: 25 points
  - $50,000-$100,000: 35 points
  - > $100,000: 40 points

- **Duration Factor (0-30 points)**
  - < 30 days: 5 points
  - 30-90 days: 12 points
  - 90-180 days: 20 points
  - > 180 days: 30 points

- **Project Type Factor (0-20 points)**
  - Security: 20 points (highest risk)
  - Infrastructure: 18 points
  - Research: 15 points
  - Mobile App: 12 points
  - Data Analysis: 10 points
  - Web Development: 8 points

- **Technical Complexity (0-10 points)**
  - Based on description length and technical terms

## 📱 Usage Guide

### For Users
1. **Register/Login** - Use email or OAuth providers
2. **Create Application** - Fill out the project form
3. **View Dashboard** - See your applications and their status
4. **Track Progress** - Monitor risk scores and admin feedback

### For Admins
1. **Admin Dashboard** - Overview of all applications
2. **Review Applications** - Approve/reject with notes
3. **View Statistics** - System-wide metrics
4. **Audit Management** - Complete change history

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes
npx prisma generate  # Generate Prisma client
npx prisma db seed   # Seed database

# Type Checking
npx tsc --noEmit     # Type check without emitting
```

## 🔧 Configuration

### Environment Variables Reference
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Application URL |
| `NEXTAUTH_SECRET` | ✅ | Random secret for JWT |
| `GITHUB_ID` | ❌ | GitHub OAuth App ID |
| `GITHUB_SECRET` | ❌ | GitHub OAuth App Secret |
| `GOOGLE_ID` | ❌ | Google OAuth Client ID |
| `GOOGLE_SECRET` | ❌ | Google OAuth Client Secret |

### Database Providers
- **Neon** (Recommended): Serverless PostgreSQL
- **Supabase**: PostgreSQL with additional features  
- **Railway**: Simple PostgreSQL hosting
- **Local**: PostgreSQL on your machine

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Supports Next.js with serverless functions
- **Railway**: Full-stack deployment with database
- **Docker**: Use the included Dockerfile

## 📊 Case Study Compliance

This project fully implements all requirements from the Full Stack Developer Case Study:

### ✅ Must-Have Features
- [x] Authentication (Email, GitHub, Google)
- [x] Add items (title, description, amount, tags)
- [x] Risk score generation with rule engine
- [x] Item list with filtering (status, score, tag)
- [x] Item detail with status changes
- [x] Complete audit logging

### ✅ Technical Requirements
- [x] Next.js App Router + TypeScript
- [x] Prisma + PostgreSQL (Neon)
- [x] NextAuth.js authentication
- [x] Proper schema design
- [x] API endpoints with filtering
- [x] Risk calculation system

### 🎯 Extra Features Implemented
- [x] Advanced filtering and search
- [x] Role-based permissions
- [x] Responsive admin panel
- [x] Comprehensive audit system
- [x] Type-safe API design
- [x] Professional UI/UX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is created for case study evaluation purposes.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check your DATABASE_URL format
# Ensure database is accessible and credentials are correct
npx prisma db push
```

**OAuth Not Working**
```bash
# Verify callback URLs in OAuth provider settings
# Check NEXTAUTH_URL matches your domain
# Ensure OAuth app is public/approved
```

**Type Errors**
```bash
# Regenerate Prisma client
npx prisma generate
# Restart TypeScript server in your editor
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

For additional support, please check the [Issues](https://github.com/mkati42/ReviewApp/issues) section.

---

**🎯 Ready for production deployment and case study evaluation!**
