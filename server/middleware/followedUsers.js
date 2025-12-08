import {
    db
} from "../db.js";

// Middleware to fetch followed users for the logged-in user and attach to res.locals
export const followedUsersMiddleware = async (req, res, next) => {
    if (!req.session?.userId) {
        res.locals.followedUsers = [];
        return next();
    }
    try {
        const {
            rows
        } = await db.query(`
      SELECT u.username, u.profile_pic_url
        FROM follows f
        JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY u.username
       LIMIT 8
    `, [req.session.userId]);
        res.locals.followedUsers = rows;
    } catch (e) {
        console.error("followedUsers middleware error:", e);
        res.locals.followedUsers = [];
    }
    next();
};