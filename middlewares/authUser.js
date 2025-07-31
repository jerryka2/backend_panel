import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const authUser = (req, res, next) => {
    console.log("🔵 Auth Middleware Hit");
    console.log("🔵 Request Headers:", req.headers);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ No token provided");
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Decoded User from Token:", decoded);

        req.user = { id: decoded.id };

        if (!req.user.id) {
            throw new Error("❌ User ID missing after decoding JWT");
        }

        console.log("✅ Authenticated User ID:", req.user.id);
        next();
    } catch (error) {
        console.error("❌ Invalid Token:", error.message);
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};

export default authUser;
