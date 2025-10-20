import mongoose from "mongoose";

const PasswordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    website: { type: String, required: true },
    username: { type: String, required: true },
    passwordEncrypted: { type: String, required: true }, // base64 ciphertext + tag
    nonce: { type: String, required: true }, // base64 iv
    
    // ✅ ADD THIS LINE
    pinned: { type: Boolean, default: false }, // Add the pinned field
    
}, { timestamps: true });

// Static method to delete a password entry by ID and user
PasswordSchema.statics.deleteByUserAndId = async function (userId, passwordId) {
    // Note: findOneAndDelete is fine, but standard deleteOne is often preferred
    return await this.findOneAndDelete({ _id: passwordId, user: userId });
};

export default mongoose.model("Password", PasswordSchema);