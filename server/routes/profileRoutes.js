import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ensureLoggedInApi } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile, exploreUsers, follow, unfollow, me, getFollowedUsers } from "../controllers/profileController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarDir = path.join(__dirname, "..", "public", "avatars");

// Multer setup for handling avatar uploads with text fields
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => cb(null, Date.now()+"-"+Math.random().toString(36).slice(2)+path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

// Profile routes - Order matters: specific routes before dynamic routes
router.get("/me", ensureLoggedInApi, me);// Get current user's profile
router.get("/followed", ensureLoggedInApi, getFollowedUsers);// Get list of followed users
router.get("/explore", ensureLoggedInApi, exploreUsers);// Explore users to follow
router.put("/", ensureLoggedInApi, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "bio", maxCount: 1 }]), updateProfile);// Update current user's profile
router.post("/follow/:username", ensureLoggedInApi, follow);// Follow a user
router.post("/unfollow/:username", ensureLoggedInApi, unfollow);// Unfollow a user
router.get("/:username", ensureLoggedInApi, getProfile);// Get profile by username - must be last

export default router;
