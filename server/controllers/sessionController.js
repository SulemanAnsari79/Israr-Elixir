import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";

export const getActiveSessions = async (_req, res) => {
  try {
    const sessions = await Session.find({
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "name email role isActive isDeleted")
      .sort({ lastActivityAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      sessions: sessions
        .filter((session) => session.userId && !session.userId.isDeleted && session.userId.isActive !== false)
        .map((session) => ({
          _id: session._id,
          sessionId: session.sessionId,
          user: {
            _id: session.userId._id,
            name: session.userId.name,
            email: session.userId.email,
            role: session.userId.role,
          },
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
          expiresAt: session.expiresAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        })),
    });
  } catch (error) {
    console.error("Get active sessions error:", error);
    return res.status(500).json({ success: false, message: "Failed to load active sessions" });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.sessionId, revokedAt: null },
      { revokedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found" });
    }

    return res.status(200).json({ success: true, message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error);
    return res.status(500).json({ success: false, message: "Failed to revoke session" });
  }
};

export const revokeUserSessions = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $inc: { sessionVersion: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await Session.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );

    return res.status(200).json({ success: true, message: "All user sessions revoked successfully" });
  } catch (error) {
    console.error("Revoke user sessions error:", error);
    return res.status(500).json({ success: false, message: "Failed to revoke user sessions" });
  }
};
