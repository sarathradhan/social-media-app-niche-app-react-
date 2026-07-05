// Profile routes. Recent changes add avatar upload validation and consistent error handling for profile updates.
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ensureLoggedInApi } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile, exploreUsers, searchUsers, follow, unfollow, me, getFollowedUsers } from "../controllers/profileController.js";
import { sendError } from "../utils/apiResponse.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarDir = path.join(__dirname, "..", "public", "avatars");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => cb(null, Date.now()+"-"+Math.random().toString(36).slice(2)+path.extname(file.originalname))
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(file.mimetype) || !allowedExt.includes(ext)) {
            return cb(new Error("Only JPG, PNG, WebP, or GIF images are allowed."));
        }
        cb(null, true);
    }
});

const uploadFields = (req, res, next) => {
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "bio", maxCount: 1 }])(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return sendError(res, 400, error.code === "LIMIT_FILE_SIZE" ? "Image size must be 5 MB or less." : "Unable to process the uploaded image.");
        }
        if (error) {
            return sendError(res, 400, error.message || "Invalid image upload.");
        }
        next();
    });
};

const router = express.Router();

// Profile routes - Order matters: specific routes before dynamic routes
router.get("/me", ensureLoggedInApi, me);// Get current user's profile
router.get("/followed", ensureLoggedInApi, getFollowedUsers);// Get list of followed users
router.get("/explore", ensureLoggedInApi, exploreUsers);// Explore users to follow
router.get("/search", ensureLoggedInApi, searchUsers);
router.put("/", ensureLoggedInApi, uploadFields, updateProfile);
router.post("/follow/:username", ensureLoggedInApi, follow);// Follow a user
router.post("/unfollow/:username", ensureLoggedInApi, unfollow);// Unfollow a user
router.get("/:username", ensureLoggedInApi, getProfile);// Get profile by username - must be last

export default router;
