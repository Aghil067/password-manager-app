import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email & password required" });
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already exists" });
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({ email, passwordHash, displayName });
        // login the user immediately
        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: "Error logging in" });
            return res.json({ user: { id: user._id, email: user.email, displayName: user.displayName } });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// login (local)
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info?.message || "Invalid credentials" });
        req.login(user, (err2) => {
            if (err2) return next(err2);
            // respond with user (omit sensitive fields)
            return res.json({ user: { id: user._id, email: user.email, displayName: user.displayName } });
        });
    })(req, res, next);
});

// logout
router.post("/logout", (req, res) => {
    req.logout(() => {
        res.json({ ok: true });
    });
});

// get current user
router.get("/me", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });
    return res.json({ user: { id: req.user._id, email: req.user.email, displayName: req.user.displayName } });
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_ROOT || "http://localhost:5173"}/`, session: true }),
    (req, res) => {
        // set success redirect to frontend dashboard
        res.redirect(`${process.env.FRONTEND_ROOT || "http://localhost:5173"}/dashboard`);
    }
);

export default router;
