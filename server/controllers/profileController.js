// Profile controller for viewing and editing user profiles, exploring users, and follow relationships.
// Recent changes standardize response payloads and keep profile update behavior consistent.
import { db } from "../db.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const me = (req, res) => {
    return sendSuccess(res, {
        user: {
            id: req.session.userId,
            username: req.session.username
        }
    });
};

// Get profile by username
export const getProfile = async (req, res) => {
    const {
        username
    } = req.params; // Extract username from request parameters
    try {
        const uRes = await db.query("SELECT id,username,bio,profile_pic_url FROM users WHERE username=$1", [username]); // Query database for user info
        if (!uRes.rowCount) return sendError(res, 404, "User not found.");
        const user = uRes.rows[0]; // Get the user data
        const {
            rows: posts
        } = await db.query(`
            SELECT p.id,
                   p.caption,
                   p.image_url,
                   p.username,
                   p.created_at,
                   u.profile_pic_url,
                   COUNT(l.id)::int AS like_count,
                   EXISTS(
                     SELECT 1 FROM likes l2
                      WHERE l2.user_id = $2 AND l2.post_id = p.id
                   ) AS user_liked,
                   (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count
              FROM posts p
              JOIN users u ON u.id = p.user_id
              LEFT JOIN likes l ON l.post_id = p.id
             WHERE p.user_id = $1
             GROUP BY p.id, u.profile_pic_url
             ORDER BY p.created_at DESC
        `, [user.id, req.session.userId || 0]);
        const {
            rows: [counts]
        } = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM follows WHERE following_id=$1) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id=$1)  AS following_count
    `, [user.id]); // Query database for follower/following counts
        // Check if current user is following this profile
        const {
            rows: [followCheck]
        } = await db.query(
            "SELECT 1 FROM follows WHERE follower_id=$1 AND following_id=$2",
            [req.session.userId, user.id]
        );
        return sendSuccess(res, {
            user,
            posts,
            isOwner: req.session.userId === user.id,
            isFollowing: !!followCheck,
            followerCount: counts.follower_count,
            followingCount: counts.following_count
        }); // Send the profile data as JSON response
    } catch (e) {
        console.error("Profile error:", e);
        return sendError(res, 500, "Unable to load the profile right now.");
    }
};

// Update current user's profile
export const updateProfile = async (req, res) => {
    try {
        const updates = []; // Array to hold update queries
        const vals = []; // Array to hold values for the update queries
        const nextIdx = () => `$${vals.length + 1}`; // Function to get the next parameter index

        // Add bio update if provided - handle both multer.fields() and regular FormData
        const bio = req.body?.bio || (req.fields?.bio && req.fields.bio[0]);
        if (bio && typeof bio === 'string' && bio.trim()) {
            updates.push(`bio = ${nextIdx()}`);
            vals.push(bio.trim());
        }
        
        // Add profile picture update if file uploaded
        if (req.files?.avatar?.[0]) {
            updates.push(`profile_pic_url = ${nextIdx()}`);
            vals.push("/avatars/" + req.files.avatar[0].filename);
        }
        
        if (updates.length === 0) return sendError(res, 400, "Please provide a bio or profile image to update."); // No updates to process

        vals.push(req.session.userId); // Add user ID to values for WHERE clause
        const idPlaceholder = `$${vals.length}`; // Placeholder for user ID in the query

        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ${idPlaceholder}`, vals);
        return sendSuccess(res, { ok: true });
    } catch (e) {
        console.error("Update profile error:", e);
        return sendError(res, 500, "Unable to update your profile.");
    }
};

// Explore users to follow
export const exploreUsers = async (req, res) => {
    try {
        const me = req.session.userId;
        const {
            rows
        } = await db.query(`
      SELECT u.id,u.username,u.profile_pic_url,
             EXISTS (SELECT 1 FROM follows f WHERE f.follower_id=$1 AND f.following_id=u.id) AS is_following
        FROM users u
       WHERE u.id<>$1
       ORDER BY u.username
    `, [me]); // Query database for users excluding the current user
        return sendSuccess(res, { users: rows }); // Send the list of users as JSON response
    } catch (e) {
        console.error(e);
        return sendError(res, 500, "Unable to load explore suggestions.");
    }
};

export const searchUsers = async (req, res) => {
    try {
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        if (!query) return sendSuccess(res, { users: [] });

        const me = req.session.userId;
        const searchTerm = `%${query.replace(/%/g, "\\%")}%`;

        const { rows } = await db.query(`
      SELECT u.id, u.username, u.profile_pic_url,
             EXISTS (SELECT 1 FROM follows f WHERE f.follower_id=$1 AND f.following_id=u.id) AS is_following
        FROM users u
       WHERE u.id <> $1
         AND u.username ILIKE $2
       ORDER BY u.username
       LIMIT 15
    `, [me, searchTerm]);

        return sendSuccess(res, { users: rows });
    } catch (e) {
        console.error("searchUsers error:", e);
        return sendError(res, 500, "Unable to search users.");
    }
};

// Follow a user
export const follow = async (req, res) => {
    try {
        const {
            rows: [tgt]
        } = await db.query("SELECT id FROM users WHERE username=$1", [req.params.username]); // Get target user by username
        if (!tgt) return sendError(res, 404, "User not found.");
        await db.query("INSERT INTO follows(follower_id,following_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.session.userId, tgt.id]);
        return sendSuccess(res, { ok: true });
    } catch (e) {
        console.error("Follow err:", e);
        return sendError(res, 500, "Unable to follow this user.");
    }
};

// Unfollow a user
export const unfollow = async (req, res) => {
    try {
        const {
            rows: [tgt]
        } = await db.query("SELECT id FROM users WHERE username=$1", [req.params.username]); // Get target user by username
        if (!tgt) return sendError(res, 404, "User not found.");
        await db.query("DELETE FROM follows WHERE follower_id=$1 AND following_id=$2", [req.session.userId, tgt.id]);
        return sendSuccess(res, { ok: true });
    } catch (e) {
        console.error("Unfollow err:", e);
        return sendError(res, 500, "Unable to unfollow this user.");
    }
};

// Get list of users that the current user is following
export const getFollowedUsers = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { rows } = await db.query(`
            SELECT u.id, u.username, u.profile_pic_url
            FROM users u
            INNER JOIN follows f ON u.id = f.following_id
            WHERE f.follower_id = $1
            ORDER BY u.username
        `, [userId]);
        
        return sendSuccess(res, { followedUsers: rows });
    } catch (e) {
        console.error("Get followed users error:", e);
        return sendError(res, 500, "Unable to load your followed users.");
    }
};