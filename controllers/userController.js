import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';

/**
 * ✅ API to Register a User
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({ name, email, password: hashedPassword });
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * ✅ API for User Login
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * ✅ API to Get User Profile
 */


const getProfile = async (req, res) => {
    try {
        console.log("🔵 Fetching profile for User ID:", req.user?.id); // ✅ Log user ID

        if (!req.user || !req.user.id) {
            console.error("❌ User ID is missing in request");
            return res.status(400).json({ success: false, message: "User authentication failed" });
        }

        const user = await userModel.findById(req.user.id).select("-password"); // ✅ Fetch user details

        if (!user) {
            console.error("❌ User not found in database!");
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("✅ User profile found:", user);
        res.json({ success: true, user });
    } catch (error) {
        console.error("❌ Error fetching profile:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};




/**
 * ✅ API to Update User Profile
 */
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, gender, dob, address } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.status(400).json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

        if (imageFile && imageFile.path) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        console.error("🚨 Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * ✅ API to Book Appointment
 */

const bookAppointment = async (req, res) => {
    try {
        console.log("🔵 Booking Appointment API Hit");
        console.log("🔵 Request Headers:", req.headers);
        console.log("🔵 Full Request Body:", JSON.stringify(req.body, null, 2));
        console.log("🔵 Extracted User ID:", req.user.id);  // ✅ Log User ID

        if (!req.user || !req.user.id) {
            console.error("❌ User ID is missing in request");
            return res.status(400).json({ success: false, message: "User authentication failed" });
        }

        const { stationData, slotData, slotTime, amount } = req.body;

        console.log("🔵 stationData:", JSON.stringify(stationData, null, 2));

        if (!stationData || !slotData || !slotTime || !amount) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!stationData._id || !stationData.name || !stationData.location || !stationData.image) {
            console.error("❌ Incomplete stationData:", JSON.stringify(stationData, null, 2));
            return res.status(400).json({ success: false, message: "Invalid station data" });
        }

        // ✅ Fetch user details from database
        const user = await userModel.findById(req.user.id).select("name email");

        if (!user) {
            console.error("❌ User not found in database");
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("✅ User details fetched:", user);

        console.log("✅ All required fields are present, proceeding with booking...");

        // ✅ Include `userData` and `statId`
        const newAppointment = new appointmentModel({
            userId: req.user.id,
            statId: stationData._id,  // ✅ Add statId separately
            userData: {
                id: req.user.id,  // ✅ Include userData
                name: user.name,
                email: user.email
            },
            stationData,
            slotData,
            slotTime,
            amount,
        });

        await newAppointment.save();
        console.log("✅ Appointment stored successfully:", newAppointment);

        res.json({ success: true, message: "✅ Appointment booked successfully", appointment: newAppointment });

    } catch (error) {
        console.error("❌ Error booking appointment:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};






//  API to get user appointments for frontend my - appointment


const listAppointment = async (req, res) => {
    try {
        console.log("🔵 Fetching Appointments for User ID:", req.user?.id);

        if (!req.user || !req.user.id) {
            console.error("❌ User ID is missing in request");
            return res.status(400).json({ success: false, message: "User authentication failed" });
        }

        const appointments = await appointmentModel.find({ userId: req.user.id });

        if (!appointments.length) {
            console.warn("⚠️ No Appointments Found for User:", req.user.id);
            return res.json({ success: true, appointments: [] });
        }

        console.log("✅ Appointments Retrieved:", appointments);
        res.json({ success: true, appointments });

    } catch (error) {
        console.error("❌ Error fetching appointments:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * ✅ API to Cancel an Appointment
 */
const cancelAppointment = async (req, res) => {
    try {
        console.log("🔵 Cancel Appointment API Hit");
        console.log("🔵 Request Headers:", req.headers);
        console.log("🔵 Extracted User ID:", req.user?.id);
        console.log("🔵 Appointment ID:", req.params.appointmentId);

        if (!req.user || !req.user.id) {
            console.error("❌ User ID is missing in request");
            return res.status(400).json({ success: false, message: "User authentication failed" });
        }

        const { appointmentId } = req.params;

        if (!appointmentId) {
            console.error("❌ Appointment ID is missing");
            return res.status(400).json({ success: false, message: "Missing appointment ID" });
        }

        // ✅ Find and delete appointment
        const appointment = await appointmentModel.findOneAndDelete({
            _id: appointmentId,
            userId: req.user.id, // Ensure the user can only cancel their own appointment
        });

        if (!appointment) {
            console.warn("⚠️ No Appointment Found for ID:", appointmentId);
            return res.status(404).json({ success: false, message: "Appointment not found or already canceled" });
        }

        console.log("✅ Appointment Canceled:", appointment);
        res.json({ success: true, message: "✅ Appointment canceled successfully", appointment });

    } catch (error) {
        console.error("❌ Error canceling appointment:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



export { bookAppointment, cancelAppointment, getProfile, listAppointment, loginUser, registerUser, updateProfile };

