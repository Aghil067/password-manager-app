import express from "express";
import crypto from "crypto";
import cors from "cors";
import Password from "../models/Password.js"; // Make sure the path is correct
import { ensureAuthenticated } from "../middleware/auth.js"; // Make sure the path is correct
import { encrypt, decrypt } from "../utils/encrypt.js"; // Make sure the path is correct

const router = express.Router();

const tokenStore = new Map();
const TOKEN_EXPIRATION_MS = 60 * 1000;

/**
 * GET all passwords for the logged-in user
 * ✅ SORTING: Pinned items first, then by creation date
 * ✅ INCLUDE: 'pinned' and 'updatedAt' fields
 */
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const docs = await Password.find({ user: req.user._id })
      .sort({ pinned: -1, createdAt: -1 }); // Pinned first (-1 means true comes first)

    const entries = docs.map((d) => ({
      _id: d._id,
      website: d.website,
      username: d.username,
      // Ensure MASTER_KEY is available in your environment variables
      password: decrypt(d.passwordEncrypted, d.nonce, process.env.MASTER_KEY),
      pinned: d.pinned, // Include pinned status
      updatedAt: d.updatedAt, // ✅ ADDED: Include the timestamp
    }));
    res.json(entries);
  } catch (err) {
    console.error("Error fetching passwords:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST a new password
 * ✅ INCLUDE: 'pinned' field (defaults to false via schema)
 */
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { website, username, password } = req.body;
    if (!website || !username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const { ciphertext, nonce } = encrypt(password, process.env.MASTER_KEY);
    const doc = await Password.create({
      user: req.user._id,
      website,
      username,
      passwordEncrypted: ciphertext,
      nonce,
      // 'pinned' will use the default value (false) from the schema
    });
    // Return the created doc's ID and initial pinned status
    res.status(201).json({ _id: doc._id, pinned: doc.pinned });
  } catch (err) {
    console.error("Error adding password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT (update) an existing password
 * ✅ INCLUDE: 'pinned' field (can be updated here, though toggle route is better)
 */
router.put("/:id", ensureAuthenticated, async (req, res) => {
  try {
    // Include 'pinned' in the destructuring
    const { website, username, password, pinned } = req.body;
    if (!website || !username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const { ciphertext, nonce } = encrypt(password, process.env.MASTER_KEY);

    const updateData = {
      website,
      username,
      passwordEncrypted: ciphertext,
      nonce,
    };
    // Only include 'pinned' in the update if it was actually provided in the request body
    if (pinned !== undefined) {
      updateData.pinned = pinned;
    }

    const updated = await Password.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true } // Return the updated document
    );
    if (!updated) {
      return res.status(404).json({ message: "Password not found" });
    }
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ ROUTE: Toggle Pin Status for a specific password - Verified Correct
 */
router.put("/:id/pin", ensureAuthenticated, async (req, res) => {
  try {
    const passwordEntry = await Password.findOne({ _id: req.params.id, user: req.user._id });

    if (!passwordEntry) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Toggle the pinned status
    passwordEntry.pinned = !passwordEntry.pinned;
    await passwordEntry.save(); // Save the change

    // Return the new pinned status
    res.json({ pinned: passwordEntry.pinned });
  } catch (err) {
    console.error("Error toggling pin status:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * DELETE a password entry
 * ✅ Using standard deleteOne
 */
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const result = await Password.deleteOne({ _id: req.params.id, user: req.user._id });

    if (result.deletedCount === 0) { // Check if a document was actually deleted
      return res.status(404).json({ message: "Not found or not authorized" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Autofill Routes (Unchanged) ---

/**
 * POST /api/passwords/generate-token (Unchanged)
 */
router.post("/generate-token", ensureAuthenticated, (req, res) => {
  const { website, username, password } = req.body;
  if (!website || !username || !password) {
    return res.status(400).json({ msg: "Please provide all credentials" });
  }
  const token = crypto.randomBytes(16).toString("hex");
  tokenStore.set(token, { website, username, password });
  setTimeout(() => {
    if (tokenStore.has(token)) {
      tokenStore.delete(token);
    }
  }, TOKEN_EXPIRATION_MS);
  res.json({ token });
});

/**
 * GET /api/passwords/get-credentials/:token (Unchanged)
 */
router.get("/get-credentials/:token", cors({ origin: "*" }), (req, res) => {
  const { token } = req.params;
  if (tokenStore.has(token)) {
    const credentials = tokenStore.get(token);
    tokenStore.delete(token);
    res.json(credentials);
  } else {
    res.status(404).json({ msg: "Token not found or has expired" });
  }
});

export default router;