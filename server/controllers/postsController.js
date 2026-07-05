// Post controller for listing, creating, liking, and deleting posts. Recent changes standardize responses
// and protect create-post actions with clearer auth handling.
import { db } from "../db.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

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
        
        return sendSuccess(res, { posts: mappedPosts });
    } catch (e) {
        console.error("getPosts error:", e);
        return sendError(res, 500, "Unable to load posts right now.");
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        if (!req.session.userId) {
            return sendError(res, 401, "Please log in to create a post.");
        }

        const caption = typeof req.body.caption === "string" ? req.body.caption.trim() : "";
        const image_url = req.file ? "/uploads/" + req.file.filename : null;

        if (!image_url && !caption) {
            return sendError(res, 400, "Post must have a caption or an image.");
        }

        const { rows } = await db.query(`
      INSERT INTO posts (username,caption,image_url,user_id)
      VALUES ($1,$2,$3,$4)
      RETURNING id
    `, [req.session.username, caption, image_url, req.session.userId]);

        return sendSuccess(res, { post: rows[0] });
    } catch (e) {
        console.error("Create post error:", e.message, e.detail || "");
        return sendError(res, 500, "We couldn't create the post. Please try again.");
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
        return sendSuccess(res, { posts: rows });
    } catch (e) {
        console.error(e);
        return sendError(res, 500, "Unable to load your posts.");
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query("DELETE FROM likes WHERE post_id=$1", [id]);
        await db.query("DELETE FROM posts WHERE id=$1 AND user_id=$2", [id, req.session.userId]);
        return sendSuccess(res, { ok: true });
    } catch (e) {
        console.error(e);
        return sendError(res, 500, "Unable to delete the post.");
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
            return sendSuccess(res, { liked: true });
        }
        return sendSuccess(res, { liked: false });
    } catch (e) {
        console.error(e);
        return sendError(res, 500, "Unable to update the like status.");
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
        
        return sendSuccess(res, { posts: mappedPosts });
    } catch (e) {
        console.error("getLiked error:", e);
        return sendError(res, 500, "Unable to load liked posts.");
    }
};

export const getComments = async (req, res) => {
    try {
        const postId = req.params.id;
        const { rows } = await db.query(`
            SELECT c.id, c.user_id, c.content, c.created_at, u.username
            FROM comments c
            JOIN users u ON u.id = c.user_id
            WHERE c.post_id = $1
            ORDER BY c.created_at DESC
        `, [postId]);
        const { rows: countRows } = await db.query("SELECT COUNT(*)::int AS count FROM comments WHERE post_id=$1", [postId]);
        return sendSuccess(res, { comments: rows, commentCount: countRows[0]?.count || 0 });
    } catch (e) {
        console.error("getComments error:", e);
        return sendError(res, 500, "Unable to load comments.");
    }
};

export const addComment = async (req, res) => {
    try {
        if (!req.session.userId) {
            return sendError(res, 401, "Please log in to comment.");
        }
        const postId = req.params.id;
        const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
        if (!content) return sendError(res, 400, "Comment cannot be empty.");
        if (content.length > 280) return sendError(res, 400, "Comment must be 280 characters or less.");

        const { rows } = await db.query(`
            INSERT INTO comments (post_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, post_id, user_id, content, created_at
        `, [postId, req.session.userId, content]);
        const comment = rows[0];
        const userRes = await db.query("SELECT username FROM users WHERE id=$1", [req.session.userId]);
        return sendSuccess(res, { comment: { ...comment, username: userRes.rows[0]?.username || "You" } });
    } catch (e) {
        console.error("addComment error:", e);
        return sendError(res, 500, "Unable to add comment.");
    }
};

export const deleteComment = async (req, res) => {
    try {
        if (!req.session.userId) {
            return sendError(res, 401, "Please log in to delete comments.");
        }
        const { id, commentId } = req.params;
        const { rowCount } = await db.query("DELETE FROM comments WHERE id=$1 AND post_id=$2 AND user_id=$3", [commentId, id, req.session.userId]);
        if (!rowCount) return sendError(res, 403, "You can only delete your own comments.");
        return sendSuccess(res, { deleted: true });
    } catch (e) {
        console.error("deleteComment error:", e);
        return sendError(res, 500, "Unable to delete comment.");
    }
};

// Edit a post's caption (owner only)
export const editPost = async (req, res) => {
    try {
        if (!req.session.userId) return sendError(res, 401, "Please log in to edit posts.");
        const id = req.params.id;
        const caption = typeof req.body.caption === "string" ? req.body.caption.trim() : "";

        // Basic validation consistent with new post composer
        if (caption.length > 220) return sendError(res, 400, "Caption must be 220 characters or less.");

        const { rows } = await db.query("SELECT id, user_id, image_url FROM posts WHERE id=$1", [id]);
        if (!rows || rows.length === 0) return sendError(res, 404, "Post not found.");
        const post = rows[0];
        if (post.user_id !== req.session.userId) return sendError(res, 403, "You can only edit your own posts.");
        if (!caption && !post.image_url) return sendError(res, 400, "Post must have a caption or an image.");

        await db.query("UPDATE posts SET caption=$1 WHERE id=$2", [caption, id]);

        const { rows: updated } = await db.query(`
            SELECT p.id, p.caption, p.image_url, p.user_id,
                   (SELECT COUNT(*) FROM likes WHERE post_id=p.id) AS like_count,
                   EXISTS(SELECT 1 FROM likes l2 WHERE l2.user_id=$1 AND l2.post_id=p.id) AS user_liked
            FROM posts p
            WHERE p.id=$2
        `, [req.session.userId, id]);

        return sendSuccess(res, { post: updated[0] });
    } catch (e) {
        console.error("editPost error:", e);
        return sendError(res, 500, "Unable to update the post.");
    }
};