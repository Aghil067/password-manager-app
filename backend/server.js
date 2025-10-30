import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import mongoose from "mongoose";

import configurePassport from "./passportConfig.js";
import authRoutes from "./routes/auth.js";
import passwordRoutes from "./routes/passwords.js";
import connectDB from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ 1. ADD THIS LINE: Tell Express to trust OnRender's proxy
app.set('trust proxy', 1);

// Connect DB
connectDB(process.env.MONGO_URI);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ROOT || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// ✅ 2. UPDATE THIS WHOLE SECTION for deployment
// Sessions (store in Mongo so sessions persist)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true, // Standard security practice
    secure: true,   // MUST be true for cross-site cookies (HTTPS)
    sameSite: 'none' // MUST be 'none' for cross-site cookies
  }
}));

// Passport: register strategies first
configurePassport();

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/passwords", passwordRoutes);

// Root health
app.get("/", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));