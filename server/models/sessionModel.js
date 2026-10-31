import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true, expires: 0 },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  revokedAt: { type: Date, default: null, index: true },
});

export default mongoose.model("Session", sessionSchema);
