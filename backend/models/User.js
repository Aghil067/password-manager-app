import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String }, // null for Google-only accounts
    displayName: { type: String },
    googleId: { type: String, index: true, sparse: true }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
