import { AUTH_COOKIE_NAME } from "../utils/authCookie.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const adminAuth = async (req,res,next)=>{
    try{
        const token = req.cookies?.[AUTH_COOKIE_NAME];

        if(!token){
            return res.status(401).json({success:false, message:"Not logged in"});
        }

        const decodedToken = verifyAccessToken(token);

        if(!decodedToken || decodedToken.role !== "admin" || decodedToken._id !== "admin"){
            return res.status(403).json({success:false, message:"Access denied. Admins only."});
        }
        
        req.admin = decodedToken;
        next(); 
    }catch(error){
        res.status(401).json({success:false, message:"Invalid token"});
    }
};

export default adminAuth;