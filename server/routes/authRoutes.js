import express from "express";
import passport from "passport";
import { signup, login, logout } from "../controllers/authController.js";// Import auth controller functions
const router = express.Router();

// Auth routes like signup, login, logout
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: (process.env.CLIENT_ORIGIN || "http://localhost:5173") + "/login" 
  }),
  (req, res) => {
    // Successful authentication - session is already set by passport
    // Set session variables
    req.session.userId = req.user.id;
    req.session.username = req.user.username;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect((process.env.CLIENT_ORIGIN || "http://localhost:5173") + "/login");
      }
      res.redirect(process.env.CLIENT_ORIGIN || "http://localhost:5173");
    });
  }
);

export default router;
