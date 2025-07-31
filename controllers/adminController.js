import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import appointmentModel from '../models/appointmentModel.js';
import stationModel from '../models/stationModel.js';
import userModel from '../models/userModel.js';


dotenv.config();

// ✅ API for adding a charging station
const addStation = async (req, res) => {
    try {
        const {
            name, email, password, brand, charging_type,
            power_capacity, pricing_per_kWh, availability, about
        } = req.body;

        const imageFile = req.file ? req.file.path : null;

        // ✅ Fix: Parse Address if Sent as a String
        const address = typeof req.body.address === "string" ? JSON.parse(req.body.address) : req.body.address;

        // ✅ Validate Required Fields
        if (!name || !email || !password || !brand || !charging_type || !power_capacity || !pricing_per_kWh || !availability || !about || !address) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // ✅ Validate Address
        if (!address.line1 || !address.line2) {
            return res.status(400).json({ success: false, message: "Address must include both 'line1' and 'line2'." });
        }

        // ✅ Validate Email Format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address." });
        }

        // ✅ Validate Strong Password
        if (!validator.isStrongPassword(password, {
            minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
        })) {
            return res.status(400).json({ success: false, message: "Password must be strong." });
        }

        // ✅ Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Upload Image to Cloudinary
        let imageUrl = null;
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        // ✅ Create New Charging Station
        const stationData = new stationModel({
            name, email, password: hashedPassword, brand, image: imageUrl,
            charging_type, power_capacity, pricing_per_kWh, availability, about,
            address: { line1: address.line1, line2: address.line2 }
        });

        // ✅ Save to Database
        await stationData.save();

        // ✅ Success Response
        res.status(201).json({ success: true, message: "EV Charging Station added successfully!", data: stationData });

    } catch (error) {
        console.error("Error in addStation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// ✅ API for Admin Login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Validate Input Fields
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        // ✅ Check Admin Credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // ✅ Ensure `expiresIn` is correctly formatted
            const expiresIn = process.env.JWT_EXPIRES_IN || "7d"; // Default to 7 days

            // ✅ Generate JWT Token
            const token = jwt.sign(
                { email, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn } // ✅ Correct format
            );

            return res.status(200).json({
                success: true,
                message: "Admin login successful!",
                token
            });
        } else {
            return res.status(401).json({ success: false, message: "Invalid admin credentials." });
        }
    } catch (error) {
        console.error("Error in loginAdmin:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// API for the All stations

const allStation = async (req, res) => {
    try {
        const stations = await stationModel.find({}).select('-password'); // ✅ Fetch all stations
        res.status(200).json({ success: true, stations });
    } catch (error) {
        console.error("Error in allStation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// API to get all appointments list

const appointmentsAdmin = async (req, res) => {

    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }


}

//  API to get cancel the appointment 
const appointmentCancel = async (req, res) => {
    try {
        console.log("🔵 Cancel Appointment API Hit");
        console.log("🔵 Extracted Appointment ID (Before Trim):", req.params.appointmentId);

        const appointmentId = req.params.appointmentId.trim(); // ✅ Trim any spaces or newline characters

        console.log("🔵 Extracted Appointment ID (After Trim):", appointmentId);

        if (!appointmentId) {
            console.error("❌ Missing appointment ID");
            return res.status(400).json({ success: false, message: "Missing appointment ID" });
        }

        // ✅ Find and mark appointment as cancelled
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            console.warn("⚠️ No Appointment Found for ID:", appointmentId);
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        appointment.isCancelled = true; // ✅ Mark as cancelled
        await appointment.save();

        console.log("✅ Appointment Marked as Cancelled:", appointment);
        res.json({ success: true, message: "✅ Appointment marked as cancelled", appointment });

    } catch (error) {
        console.error("❌ Error cancelling appointment:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//  API for the admin dashboard data for admin panel

const adminDashboard = async (req, res) => {
    try {
        const stations = await stationModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({}).sort({ createdAt: -1 }).limit(5);

        const dashData = {
            stations: stations.length,
            appointments: appointments.length,
            user: users.length,
            latestAppointments: appointments.map((appointment) => ({
                _id: appointment._id,
                stationData: appointment.stationData, // ✅ Ensure stationData exists
                slotDate: appointment.slotDate, // ✅ Ensure slotDate exists
                slotTime: appointment.slotTime, // ✅ Include slotTime for more details
                isCancelled: appointment.isCancelled,
            })),
        };

        res.json({ success: true, dashData });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};







export { addStation, adminDashboard, allStation, appointmentCancel, appointmentsAdmin, loginAdmin };

