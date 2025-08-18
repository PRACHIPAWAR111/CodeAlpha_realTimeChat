/*import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const protectRoute = async (req, res, next) => {
    try {
    const token = req.cookie.jwt;
    if (!token){
        return  res.status(401).json({message: "Unauthorized-no token provided"});
    }
       const  decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
       if (!decoded){
        return res.status(401).json({message: "Unauthorized-invalid token"});
       }
       const user = await User.findById(decoded.userId).select("-password");

       if (!user){
        return res.status(401).json({message: "Unauthorized-user not found"}); 
       }
      req.user = user;
       next();
    }catch(error){
      console.log("Error in protectRoute middleware", error);
      return res.status(500).json({message: "Internal Server Error"});
    }
} */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        // Access the token from cookies
        const token = req.cookies.jwt; // Corrected from req.cookie to req.cookies
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - no token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - invalid token" });
        }

        // Find the user by ID
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized - user not found" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
