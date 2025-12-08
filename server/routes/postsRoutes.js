import express from "express";//importing express framework
import multer from "multer";//importing multer for handling file uploads
import path from "path";//importing path module to work with file and directory paths
import { fileURLToPath } from "url";//importing fileURLToPath to get the current file path
import { getPosts, createPost, getMyPosts, deletePost, toggleLike, getLiked } from "../controllers/postsController.js";//importing post controller functions
import { ensureLoggedInApi } from "../middleware/authMiddleware.js";//importing middleware to ensure user is logged in

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "public", "uploads");

// Multer setup for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

router.get("/", getPosts);// Public route to get all posts with get request
router.post("/", ensureLoggedInApi, upload.single("image"), createPost);// Protected route to create a new post with post request
router.get("/mine", ensureLoggedInApi, getMyPosts);// Protected route to get user's own posts with get request
router.delete("/:id", ensureLoggedInApi, deletePost);// Protected route to delete a post with delete request
router.post("/:id/like", ensureLoggedInApi, toggleLike);// Protected route to like/unlike a post with post request
router.get("/liked", ensureLoggedInApi, getLiked);// Protected route to get liked posts with get request

// Export the router to be used in the main server file
export default router;
