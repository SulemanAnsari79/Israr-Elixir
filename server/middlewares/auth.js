import User from "../models/userModel.js";
import { AUTH_COOKIE_NAME } from "../utils/authCookie.js";
import { verifyAccessToken } from "../utils/jwt.js";
import Session from "../models/sessionModel.js";

const auth = async (req,res,next)=>{
  try{
    const token = req.cookies?.[AUTH_COOKIE_NAME];
 
    if(!token){
      return res.status(401).json({success:false, message:"Not logged in"});
    }

    const decodedToken = verifyAccessToken(token);
    
    if (!decodedToken || !decodedToken.role || !['user', 'doctor', 'admin', 'delivery'].includes(decodedToken.role)) {
          return res.status(403).json({success:false, message: "Access Denied" });
    }
    if (decodedToken.role !== "admin") {
      const user = await User.findById(decodedToken._id);
      if (!user || user.isDeleted || user.isActive === false) {
        return res.status(401).json({success:false, message:"Account is not active"});
      } 
      if (decodedToken.sessionVersion !== user.sessionVersion) {
        return res.status(401).json({success:false, message:"Session has been revoked"});
      }
      if (decodedToken.sessionId) {
        const session = await Session.findOneAndUpdate(
          { sessionId: decodedToken.sessionId, revokedAt: null, expiresAt: { $gt: new Date() } },
          { lastActivityAt: new Date() }
        );
        if (!session) {
          return res.status(401).json({success:false, message:"Session has expired or been revoked"});
        }
      }
      req.user = user;
    } else {
      req.user = decodedToken;
    }
    next();     
  }catch(error){
    res.status(401).json({success:false, message:"Invalid token"});
  }
};

export default auth;