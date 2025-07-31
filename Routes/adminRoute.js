import express from "express";
import { addStation, adminDashboard, allStation, appointmentCancel, appointmentsAdmin, loginAdmin } from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multer.js";

const adminRouter = express.Router();

adminRouter.post('/add-station', authAdmin, upload.single('image'), addStation);
adminRouter.post('/login', loginAdmin);
adminRouter.get('/all-stations', authAdmin, allStation);
adminRouter.get('/all-appointments', authAdmin, appointmentsAdmin);

// ✅ Changed from GET to DELETE and added appointmentId as a parameter
adminRouter.delete('/cancel-appointment/:appointmentId', authAdmin, appointmentCancel);
adminRouter.get('/dashboard', authAdmin, adminDashboard)

export default adminRouter;
