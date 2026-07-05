// Auth controller for signup and login. Recent changes normalize input values, enforce clearer validation,
// and return consistent success/error payloads for the client.
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

export const signup = async (req, res) => {
    const { username, password } = req.body;
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!trimmedUsername || !trimmedPassword) {
        return sendError(res, 400, "Username and password are required.");
    }
    if (trimmedUsername.length < 3) {
        return sendError(res, 400, "Username must be at least 3 characters.");
    }
    if (trimmedPassword.length < 6) {
        return sendError(res, 400, "Password must be at least 6 characters.");
    }

    const hash = await bcrypt.hash(trimmedPassword, 10);
    try {
        const { rows } = await db.query("INSERT INTO users (username,password) VALUES ($1,$2) RETURNING id", [trimmedUsername, hash]);
        const user = rows[0];
        req.session.userId = user.id;
        req.session.username = trimmedUsername;
        // Ensure cookie attributes are explicit for cross-origin requests
        req.session.cookie = req.session.cookie || {};
        req.session.cookie.sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
        req.session.cookie.secure = process.env.NODE_ENV === "production";

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return sendError(res, 500, "Unable to create your session right now.");
            }
            return sendSuccess(res, { user: { id: user.id, username: trimmedUsername } });
        });
    } catch (e) {
        console.error("Signup error:", e);
        if (e.code === "23505") {
            return sendError(res, 409, "Username already exists.");
        }
        return sendError(res, 500, "Signup failed. Please try again.");
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!trimmedUsername || !trimmedPassword) {
        return sendError(res, 400, "Username and password are required.");
    }

    try {
        const { rows } = await db.query("SELECT * FROM users WHERE username=$1", [trimmedUsername]);
        const user = rows[0];
        if (user && await bcrypt.compare(trimmedPassword, user.password)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            // Ensure cookie attributes are explicit for cross-origin requests
            req.session.cookie = req.session.cookie || {};
            req.session.cookie.sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
            req.session.cookie.secure = process.env.NODE_ENV === "production";

            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return sendError(res, 500, "Unable to create your session right now.");
                }
                return sendSuccess(res, {
                    user: {
                        id: user.id,
                        username: user.username,
                        profile_pic_url: user.profile_pic_url
                    }
                });
            });
            return;
        }
        return sendError(res, 401, "Invalid username or password.");
    } catch (e) {
        console.error("Login error:", e);
        return sendError(res, 500, "Login failed. Please try again.");
    }
};

export const logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return sendError(res, 500, "Logout failed.");
            }
            return sendSuccess(res, { ok: true });
        });
    } else {
        return sendSuccess(res, { ok: true });
    }
};