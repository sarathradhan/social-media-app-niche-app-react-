import {
   db
} from "../db.js";

// Get current logged-in user's info
export const me = (req, res) => {
    res.json({
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
        if (!uRes.rowCount) return res.status(404).json({
            error: "User not found"
        });
        const user = uRes.rows[0]; // Get the user data
        const {
            rows: posts
        } = await db.query("SELECT id,image_url FROM posts WHERE user_id=$1 ORDER BY created_at DESC", [user.id]); // Query database for user's posts
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
        res.json({
            user,
            posts,
            isOwner: req.session.userId === user.id,
            isFollowing: !!followCheck,
            followerCount: counts.follower_count,
            followingCount: counts.following_count
        }); // Send the profile data as JSON response
    } catch (e) {
        console.error("Profile error:", e);
        res.status(500).json({
            error: "Server error"
        });
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
        
        if (updates.length === 0) return res.status(400).json({
            error: "No updates provided"
        }); // No updates to process

        vals.push(req.session.userId); // Add user ID to values for WHERE clause
        const idPlaceholder = `$${vals.length}`; // Placeholder for user ID in the query

        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ${idPlaceholder}`, vals); // Execute the update query
        res.json({
            ok: true
        });
    } catch (e) {
        console.error("Update profile error:", e);
        res.status(500).json({
            error: "Failed to update profile"
        });
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
        res.json({
            users: rows
        }); // Send the list of users as JSON response
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: "Failed to load explore"
        });
    }
};

// Follow a user
export const follow = async (req, res) => {
    try {
        const {
            rows: [tgt]
        } = await db.query("SELECT id FROM users WHERE username=$1", [req.params.username]); // Get target user by username
        if (!tgt) return res.status(404).json({
            error: "User not found"
        });
        await db.query("INSERT INTO follows(follower_id,following_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [req.session.userId, tgt.id]); // Insert follow relationship into database
        res.json({
            ok: true
        });
    } catch (e) {
        console.error("Follow err:", e);
        res.status(500).json({
            error: "Failed to follow"
        });
    }
};

// Unfollow a user
export const unfollow = async (req, res) => {
    try {
        const {
            rows: [tgt]
        } = await db.query("SELECT id FROM users WHERE username=$1", [req.params.username]); // Get target user by username
        if (!tgt) return res.status(404).json({
            error: "User not found"
        });
        await db.query("DELETE FROM follows WHERE follower_id=$1 AND following_id=$2", [req.session.userId, tgt.id]); // Delete follow relationship from database
        res.json({
            ok: true
        });
    } catch (e) {
        console.error("Unfollow err:", e);
        res.status(500).json({
            error: "Failed to unfollow"
        });
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
        
        res.json({
            followedUsers: rows
        });
    } catch (e) {
        console.error("Get followed users error:", e);
        res.status(500).json({
            error: "Failed to fetch followed users"
        });
    }
};