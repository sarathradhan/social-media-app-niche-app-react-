import {
    db
} from "../db.js";

// Get all posts with user info and like status
export const getPosts = async (req, res) => {
    try {
        const {
            rows: posts
        } = await db.query(`
      SELECT p.id,
             p.username,
             p.caption,
             p.image_url,
             p.user_id,
             p.created_at,
             u.username as user_username,
             u.profile_pic_url,
             COUNT(l.id) AS like_count,
             EXISTS(SELECT 1 FROM likes l2 WHERE l2.user_id=$1 AND l2.post_id=p.id) AS user_liked
        FROM posts p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN likes l ON l.post_id = p.id
       GROUP BY p.id, u.id, u.username, u.profile_pic_url
       ORDER BY p.created_at DESC
    `, [req.session.userId || 0]);
        
        // Map results to rename user_username back to match frontend expectations
        const mappedPosts = posts.map(post => ({
          ...post,
          username: post.username || post.user_username,
          profile_pic_url: post.profile_pic_url
        }));
        
        res.json({
            posts: mappedPosts
        });
    } catch (e) {
        console.error("getPosts error:", e);
        res.status(500).json({
            error: "Error loading posts"
        });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        // Using route-level multer.single("image"), file will be in req.file
        const caption = req.body.caption || "";
        const image_url = req.file ? "/uploads/" + req.file.filename : null;
        
        if (!image_url && !caption) {
            return res.status(400).json({ error: "Post must have caption or image" });
        }
        
        const { rows } = await db.query(`
      INSERT INTO posts (username,caption,image_url,user_id)
      VALUES ($1,$2,$3,$4)
      RETURNING id
    `, [req.session.username, caption, image_url, req.session.userId]);
        
        res.json({
            ok: true,
            post: rows[0]
        });
    } catch (e) {
        console.error("Create post error:", e.message, e.detail || "");
        res.status(500).json({
            error: "Failed to create post: " + e.message
        });
    }
};

// Get posts of the logged-in user
export const getMyPosts = async (req, res) => {
    try {
        const {
            rows
        } = await db.query(`
      SELECT p.*,u.username,u.profile_pic_url
        FROM posts p
        JOIN users u ON u.id=p.user_id
       WHERE p.user_id=$1
       ORDER BY p.created_at DESC
    `, [req.session.userId]);
        res.json({
            posts: rows
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: "Failed to load myposts"
        });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query("DELETE FROM likes WHERE post_id=$1", [id]);
        await db.query("DELETE FROM posts WHERE id=$1 AND user_id=$2", [id, req.session.userId]);
        res.json({
            ok: true
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: "Failed to delete post"
        });
    }
};

// Like or unlike a post
export const toggleLike = async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId;
    try {
        const del = await db.query("DELETE FROM likes WHERE user_id=$1 AND post_id=$2 RETURNING 1", [userId, postId]);
        if (del.rowCount === 0) {
            await db.query("INSERT INTO likes(user_id,post_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [userId, postId]);
            return res.json({
                liked: true
            });
        }
        res.json({
            liked: false
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: "Failed to toggle like"
        });
    }
};

// Get posts liked by the logged-in user
export const getLiked = async (req, res) => {
    try {
        const {
            rows
        } = await db.query(`
      SELECT p.id,
             p.username,
             p.caption,
             p.image_url,
             p.user_id,
             p.created_at,
             u.username as user_username,
             u.profile_pic_url,
             TRUE AS user_liked,
             (SELECT COUNT(*) FROM likes WHERE post_id=p.id) AS like_count
        FROM likes l
        JOIN posts p ON p.id=l.post_id
        JOIN users u ON u.id=p.user_id
       WHERE l.user_id=$1
       ORDER BY p.created_at DESC
    `, [req.session.userId]);
        
        // Map results to ensure username field is set
        const mappedPosts = rows.map(post => ({
          ...post,
          username: post.username || post.user_username,
          profile_pic_url: post.profile_pic_url
        }));
        
        res.json({
            posts: mappedPosts
        });
    } catch (e) {
        console.error("getLiked error:", e);
        res.status(500).json({
            error: "Error loading liked posts"
        });
    }
};