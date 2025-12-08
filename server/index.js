import express from "express";//importing express framework
import bodyParser from "body-parser";//body-parser middleware to parse incoming request bodies
import path from "path";//path module to work with file and directory paths
import { fileURLToPath } from "url";//to get the current file path
import session from "express-session";//session middleware for managing user sessions
import cors from "cors";//CORS middleware to enable cross-origin resource sharing
import dotenv from "dotenv";//dotenv to load environment variables from a .env file
import passport from "passport";//importing passport for authentication
import "./auth.js"; // passport strategies
import authRoutes from "./routes/authRoutes.js";//importing authentication routes
import postsRoutes from "./routes/postsRoutes.js";//importing posts routes
import profileRoutes from "./routes/profileRoutes.js"; //importing profile routes
import { followedUsersMiddleware } from "./middleware/followedUsers.js";//importing custom middleware to handle followed users

// Initialize environment variables
dotenv.config();

// Initialize Express app
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Custom middleware to handle FormData text fields
app.use((req, res, next) => {
  // If body already parsed by multer, we don't need to do anything
  if (req.body && typeof req.body === 'object' && req.body.bio) {
    return next();
  }
  // Otherwise continue to next middleware
  next();
});

// Session setup - MUST be before routes
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// static folders
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/avatars", express.static(path.join(__dirname, "public", "avatars")));
app.use(express.static(path.join(__dirname, "public")));

// add followedUsers to res.locals for routes that might use it
app.use(followedUsersMiddleware);

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/profile", profileRoutes);

// health
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
