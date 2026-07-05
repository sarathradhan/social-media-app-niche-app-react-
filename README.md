# 🚀 Niche - Social Media App

A complete, production-ready social media platform built with React, Express, PostgreSQL, and Google OAuth authentication.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Running Locally](#running-locally)
7. [Configuration](#configuration)
8. [API Endpoints](#api-endpoints)
9. [How It Works](#how-it-works)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

---

## 📱 Project Overview

**Niche** is a modern social media application where users can:
- Create accounts and authenticate via email or Google OAuth
- Create and share posts with images
- Follow/unfollow other users
- Like and unlike posts
- View their own posts and liked posts
- Explore other users and their content
- Manage their profile with avatar and bio

The app is fully functional, tested, and ready for production deployment.

---

## ✨ Features

### Authentication
- ✅ Email/Password signup and login
- ✅ Google OAuth 2.0 integration
- ✅ Session-based authentication with secure cookies
- ✅ Password hashing with bcrypt

### Posts
- ✅ Create posts with text and/or images
- ✅ Upload images via Multer
- ✅ View feed with all posts (newest first)
- ✅ View personal posts
- ✅ Delete own posts
- ✅ Like/unlike posts
- ✅ View liked posts

### Users & Profiles
- ✅ User profiles with avatar and bio
- ✅ Follow/unfollow functionality
- ✅ User discovery and exploration
- ✅ View other users' posts

### UI/UX
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Modern CSS with media queries
- ✅ Smooth navigation with React Router
- ✅ Toast notifications for user feedback
- ✅ Image modal for full-size viewing
- ✅ Loading states

---

## 🛠 Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **React Router 7.10.1** - Client-side routing
- **Vite** - Build tool (Rolldown)
- **CSS3** - Styling with responsive design
- **JavaScript ES6+** - Programming language

### Backend
- **Express 5.2.1** - Web framework
- **Node.js** - Runtime
- **PostgreSQL** - Database
- **Passport.js 0.7.0** - Authentication middleware
- **Multer 2.0.2** - File upload handling
- **bcrypt 6.0.0** - Password hashing
- **express-session 1.18.2** - Session management
- **CORS 2.8.5** - Cross-origin requests

### Tools & Services
- **Vite** - Frontend build
- **Nodemon** - Development server restart
- **dotenv** - Environment variable management

---

## 📁 Project Structure

```
Project/
├── client/                          # React frontend
│   ├── src/
│   │   ├── App.jsx                 # Main app component (routing, session)
│   │   ├── Feed.jsx                # Home feed with posts
│   │   ├── Explore.jsx             # Discover users
│   │   ├── New.jsx                 # Create new post
│   │   ├── MyPosts.jsx             # User's own posts
│   │   ├── Liked.jsx               # Liked posts
│   │   ├── Profile.jsx             # User profile page
│   │   ├── Login.jsx               # Login page
│   │   ├── signup.jsx              # Signup page
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── Side2.jsx               # Right sidebar (followed users)
│   │   ├── Toast.jsx               # Toast notifications
│   │   ├── api.jsx                 # API helper functions
│   │   ├── App.css                 # Main stylesheet
│   │   ├── index.css               # Global styles
│   │   ├── main.jsx                # Entry point
│   │   └── assets/                 # Images and resources
│   ├── public/                      # Static files
│   │   ├── ICONS/                  # SVG icons
│   │   ├── FONTS/                  # Font files
│   │   └── *.png/*.jpeg             # Images
│   ├── index.html                   # HTML template
│   ├── vite.config.js              # Vite config
│   ├── package.json                # Dependencies
│   ├── .env                        # Environment variables (don't commit)
│   └── .env.example                # Template
│
├── server/                          # Express backend
│   ├── index.js                    # Server entry point
│   ├── auth.js                     # Passport strategies
│   ├── db.js                       # Database connection
│   ├── controllers/
│   │   ├── authController.js       # Auth logic (signup/login)
│   │   ├── postsController.js      # Posts logic
│   │   └── profileController.js    # Profile logic
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── postsRoutes.js          # Posts endpoints
│   │   └── profileRoutes.js        # Profile endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js       # Auth checks
│   │   └── followedUsers.js        # Followed users middleware
│   ├── public/
│   │   ├── uploads/                # User post images
│   │   ├── avatars/                # User profile pictures
│   │   ├── ICONS/                  # Static icons
│   │   └── FONTS/                  # Font files
│   ├── package.json                # Dependencies
│   ├── .env                        # Environment variables (don't commit)
│   └── .env.example                # Template
│
├── views/                           # EJS templates (legacy, not used)
│
├── DEPLOYMENT_GUIDE.md             # Detailed deployment instructions
├── DEPLOYMENT_CHECKLIST.md         # Step-by-step checklist
├── FEED_JSON_STRUCTURE.md          # Feed data format
├── IMAGE_ACCESS_GUIDE.md           # How images work
├── FIXES_APPLIED.md                # What was fixed
├── START_HERE.md                   # Getting started guide
├── README_FIXES.md                 # Quick summary
├── QUICK_START.txt                 # Visual summary
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 16+ and npm
- **PostgreSQL** 12+
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/sarathradhan/social-media-app.git
cd social-media-app
```

### Step 2: Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../server
npm install
```

### Step 3: Setup Database

Create PostgreSQL database:
```sql
CREATE DATABASE website;
```

Create tables (run in PostgreSQL):
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  profile_pic_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  username VARCHAR(255),
  caption TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id),
  UNIQUE(user_id, post_id)
);

-- Follows table
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id),
  following_id INTEGER REFERENCES users(id),
  UNIQUE(follower_id, following_id)
);
```

### Step 4: Configure Environment Variables

**Backend (`server/.env`):**
```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=website

# Session
SESSION_SECRET=generate-random-string-here

# Google OAuth (regenerate these!)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend (`client/.env`):**
```
VITE_API_BASE=http://localhost:5000
```

### Step 5: Generate Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output to `server/.env` SESSION_SECRET

---

## 🏃 Running Locally

### Terminal 1 - Backend
```bash
cd server
npm install
node index.js
# Server listening on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm install
npm run dev
# Local: http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env):**
| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | `development` or `production` |
| PORT | Server port | `5000` |
| DB_HOST | Database host | `localhost` |
| DB_PORT | Database port | `5432` |
| DB_USER | Database user | `postgres` |
| DB_PASSWORD | Database password | Strong password |
| DB_NAME | Database name | `website` |
| SESSION_SECRET | Session encryption key | Random 32-char string |
| GOOGLE_CLIENT_ID | Google OAuth ID | From Google Cloud Console |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | From Google Cloud Console |
| GOOGLE_CALLBACK_URL | OAuth redirect URI | `http://localhost:5000/api/auth/google/callback` |
| CLIENT_ORIGIN | Frontend URL | `http://localhost:5173` |

**Frontend (.env):**
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_BASE | Backend API URL | `http://localhost:5000` |

### API_BASE Constant

Frontend uses centralized `API_BASE` from `client/src/api.jsx`:
```javascript
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
```

All API calls and image URLs use this constant.

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/signup` | Create new account | No |
| POST | `/login` | Login with credentials | No |
| POST | `/logout` | Logout | Yes |
| GET | `/google` | Start Google OAuth flow | No |
| GET | `/google/callback` | Google OAuth callback | No |

### Posts (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all posts | No |
| POST | `/` | Create new post | Yes |
| GET | `/mine` | Get user's posts | Yes |
| DELETE | `/:id` | Delete post | Yes |
| POST | `/:id/like` | Like/unlike post | Yes |
| GET | `/liked` | Get liked posts | Yes |

### Profile (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/me` | Get current user | Yes |
| GET | `/followed` | Get followed users | Yes |
| GET | `/:username` | Get user profile | No |
| PUT | `/update` | Update profile | Yes |
| GET | `/explore` | Get all users | No |
| POST | `/:userId/follow` | Follow user | Yes |
| POST | `/:userId/unfollow` | Unfollow user | Yes |

---

## 🎯 How It Works

### Authentication Flow

**Traditional Login:**
1. User enters username/password → POST `/api/auth/signup` or `/api/auth/login`
2. Server hashes password with bcrypt
3. Server creates session and returns user data
4. Frontend stores session (httpOnly cookie automatically managed)

**Google OAuth:**
1. User clicks "Login with Google"
2. Browser redirects to `/api/auth/google`
3. Server initiates Passport Google flow
4. User authorizes on Google
5. Google redirects to `/api/auth/google/callback` with code
6. Server exchanges code for profile
7. Server creates user if new, sets session
8. Server redirects to frontend
9. User is logged in

### Post Creation
1. User selects image and writes caption
2. Frontend sends FormData with image file → POST `/api/posts`
3. Server uses Multer to save image to `public/uploads/`
4. Server stores image path in database
5. Frontend fetches posts, displays with `${API_BASE}${image_url}`

### Image Display
```
Database: "/uploads/1733671234567.jpg"
          +
Frontend API_BASE: "http://localhost:5000"
          =
Full URL: "http://localhost:5000/uploads/1733671234567.jpg"
          ↓
Browser fetches image from server's express.static() middleware
          ↓
Image displays in <img> tag
```

### Feed Loading
1. Frontend calls GET `/api/posts`
2. Server queries posts with user info and like counts
3. Server returns JSON array with all post data
4. Frontend maps over posts and renders cards
5. Each card shows: avatar, username, caption, image, like count

---

## 🚀 Deployment

### Prerequisites for Deployment
- ✅ Regenerate Google OAuth credentials
- ✅ Generate strong SESSION_SECRET
- ✅ Set strong database password
- ✅ Production-grade PostgreSQL database
- ✅ HTTPS enabled on both frontend and backend

### Deployment Options

**Backend Hosting:**
- **Railway** (easiest, includes PostgreSQL)
- **Heroku**
- **AWS EC2 / AppRunner**
- **Azure App Service**
- **Render**

**Frontend Hosting:**
- **Vercel** (best for Vite)
- **Netlify**
- **AWS S3 + CloudFront**

### Quick Deploy with Railway + Vercel

**Backend on Railway:**
```bash
npm install -g @railway/cli
cd server
railway login
railway init
railway up
```

**Frontend on Vercel:**
```bash
npm install -g vercel
cd client
vercel deploy --prod
```

### Environment Variables for Production

**Backend:**
```
NODE_ENV=production
PORT=5000
DB_HOST=your-prod-db-host
DB_USER=prod_user
DB_PASSWORD=strong-production-password
DB_NAME=prod_database
SESSION_SECRET=your-generated-secret-key
GOOGLE_CLIENT_ID=new-production-id
GOOGLE_CLIENT_SECRET=new-production-secret
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
CLIENT_ORIGIN=https://your-frontend-domain.com
```

**Frontend:**
```
VITE_API_BASE=https://your-api-domain.com
```

### Post-Deployment Steps
1. Update Google Cloud Console with production URLs
2. Test OAuth flow
3. Test file uploads
4. Enable HTTPS everywhere
5. Set up monitoring/logging
6. Regular database backups

---

## 🐛 Troubleshooting

### Feed Page is Blank
**Problem:** Posts don't show on feed
**Solution:** Check browser console for errors. Verify API_BASE in client/.env. Ensure backend is running.

### Images Not Loading
**Problem:** Images show broken image icon
**Solution:** 
- Verify image_url in database has correct path (starts with `/`)
- Check API_BASE is correct
- Verify server is serving static files from `public/uploads/`
- Check file actually exists in `server/public/uploads/`

### Database Connection Error
**Problem:** Server can't connect to PostgreSQL
**Solution:**
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Verify database and tables exist
- Check firewall/security rules

### Google OAuth Not Working
**Problem:** OAuth flow fails or redirects incorrectly
**Solution:**
- Verify Google credentials are correct and not expired
- Check GOOGLE_CALLBACK_URL matches exactly in Google Cloud Console
- Ensure CLIENT_ORIGIN is correct
- Clear browser cookies and try again

### Port Already in Use
**Problem:** Port 5000 or 5173 already in use
**Solution:**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env and client/.env
```

### Build Fails
**Problem:** npm run build fails
**Solution:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Key Files Explained

### Frontend
- **App.jsx** - Main component, handles routing and session
- **api.jsx** - Centralized API calls and API_BASE constant
- **Feed.jsx** - Home feed with all posts
- **[Component].jsx** - Each page component
- **App.css** - Main stylesheet (753 lines, responsive)

### Backend
- **index.js** - Server setup, middleware, routes mounting
- **auth.js** - Passport strategies (Google OAuth)
- **db.js** - PostgreSQL connection with SSL support
- **controllers/** - Business logic for auth, posts, profile
- **routes/** - API endpoint definitions
- **middleware/** - Auth checks, helpers

### Database
- **users** - User accounts
- **posts** - User posts
- **likes** - Post likes
- **follows** - User follows/followers

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Session-based auth with httpOnly cookies
- ✅ CORS enabled only for frontend origin
- ✅ Environment variables for sensitive data
- ✅ SQL injection protection via parameterized queries
- ✅ SSL/TLS for production database connections
- ✅ Multer file upload validation
- ✅ Authentication middleware on protected routes
- ✅ Google OAuth 2.0 with refresh tokens

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Commit with clear messages
5. Push and create PR

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review DEPLOYMENT_GUIDE.md for detailed instructions
3. Check browser console and server logs for errors
4. Verify all environment variables are set correctly

---

## ✅ Deployment Checklist

- [ ] Regenerate Google OAuth credentials
- [ ] Generate SESSION_SECRET
- [ ] Set strong database password
- [ ] Update CLIENT_ORIGIN in server/.env
- [ ] Update VITE_API_BASE in client/.env
- [ ] Update GOOGLE_CALLBACK_URL to production domain
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Deploy backend to hosting platform
- [ ] Deploy frontend (dist/ folder) to hosting
- [ ] Update Google Cloud Console with production URLs
- [ ] Test OAuth flow on production
- [ ] Test file uploads on production
- [ ] Enable HTTPS everywhere
- [ ] Set up monitoring and alerts
- [ ] Configure database backups

---

## 🎉 Status

**✅ PRODUCTION READY**

Current version: 1.0.0
Last updated: December 8, 2025

The application is fully functional, tested, and ready for deployment. Just complete the 3 pre-deployment steps and you're live!

---

**Built with ❤️ by Niche Team**
