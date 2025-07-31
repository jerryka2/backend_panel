import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load environment variables

const authAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
};



export default authAdmin;
