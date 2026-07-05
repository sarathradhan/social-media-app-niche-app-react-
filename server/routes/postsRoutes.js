// Post routes. Recent changes add server-side upload validation and enforce a 5 MB image limit before files reach the controller.
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getPosts, createPost, getMyPosts, deletePost, toggleLike, getLiked, getComments, addComment, deleteComment, editPost } from "../controllers/postsController.js";
import { ensureLoggedInApi } from "../middleware/authMiddleware.js";
import { sendError } from "../utils/apiResponse.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "public", "uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
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

const uploadSingle = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
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

router.get("/", getPosts);// Public route to get all posts with get request
router.post("/", ensureLoggedInApi, uploadSingle, createPost);
router.get("/mine", ensureLoggedInApi, getMyPosts);// Protected route to get user's own posts with get request
router.delete("/:id", ensureLoggedInApi, deletePost);// Protected route to delete a post with delete request
router.patch("/:id", ensureLoggedInApi, editPost);// Protected route to edit a post's caption (owner only)
router.post("/:id/like", ensureLoggedInApi, toggleLike);// Protected route to like/unlike a post with post request
router.get("/liked", ensureLoggedInApi, getLiked);// Protected route to get liked posts with get request
router.get("/:id/comments", getComments);
router.post("/:id/comments", ensureLoggedInApi, addComment);
router.delete("/:id/comments/:commentId", ensureLoggedInApi, deleteComment);

// Export the router to be used in the main server file
export default router;
