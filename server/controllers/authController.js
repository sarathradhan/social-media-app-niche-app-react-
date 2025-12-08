import bcrypt from "bcrypt";
import {
    db
} from "../db.js";

// User signup
export const signup = async (req, res) => {
    const {
        username,
        password
    } = req.body;
    if (!username || !password) return res.status(400).json({
        error: "Missing username or password"
    });
    if (username.length < 3) return res.status(400).json({
        error: "Username must be at least 3 characters"
    });
    if (password.length < 6) return res.status(400).json({
        error: "Password must be at least 6 characters"
    });
    
    const hash = await bcrypt.hash(password, 10); // Hash the password
    try {
        const { rows } = await db.query("INSERT INTO users (username,password) VALUES ($1,$2) RETURNING id", [username, hash]);
        const user = rows[0];
        req.session.userId = user.id;
        req.session.username = username;
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({
                    error: "Session error"
                });
            }
            res.json({
                ok: true,
                user: {
                    id: user.id,
                    username: username
                }
            });
        });
    } catch (e) {
        console.error("Signup error:", e);
        if (e.code === '23505') { // Unique violation
            return res.status(409).json({
                error: "Username already exists"
            });
        }
        res.status(500).json({
            error: "Signup failed"
        });
    }
};

// User login
export const login = async (req, res) => {
    const {
        username,
        password
    } = req.body;
    if (!username || !password) return res.status(400).json({
        error: "Missing username or password"
    });
    
    try {
        const {
            rows
        } = await db.query("SELECT * FROM users WHERE username=$1", [username]);
        const user = rows[0];
        if (user && await bcrypt.compare(password, user.password)) { // Verify password
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({
                        error: "Session error"
                    });
                }
                return res.json({
                    ok: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        profile_pic_url: user.profile_pic_url
                    }
                }); // Successful login
            });
            return;
        }
        res.status(401).json({
            error: "Invalid credentials"
        });
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({
            error: "Login failed"
        });
    }
};

// User logout
export const logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Logout failed" });
            }
            res.json({ ok: true });
        });
    } else {
        res.json({ ok: true });
    }
};