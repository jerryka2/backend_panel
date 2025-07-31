import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectCloudinary from './config/cloudinary.js';
import connectDB from './config/mongodb.js';
import adminRouter from './Routes/adminRoute.js';
import stationRouter from './Routes/stationRoute.js';
import userRouter from './Routes/userRoute.js';

// ✅ App config
const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect DB & Cloudinary
connectDB();
connectCloudinary();

// ✅ CORS Middleware Configuration
app.use(cors({
    origin: '*', // ✅ Allow All Origins (for testing)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // ✅ Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'token'] // ✅ Allow specific headers
}));

// ✅ Middleware to Parse JSON
app.use(express.json());

// ✅ API Endpoints
app.use('/api/admin', adminRouter);
app.use('/api/station', stationRouter);
app.use('/api/user', userRouter)

// ✅ Test Route
app.get('/', (req, res) => {
    res.send('API WORKING');
});

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
