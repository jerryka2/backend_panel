import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    brand: { type: String, required: true, trim: true }, // Tesla, MG, BYD, etc.

    image: { type: String, required: true, trim: true }, // Cloudinary or file path

    charging_type: { type: String, required: true, trim: true }, // Fast Charging, Ultra-Fast, etc.
    power_capacity: { type: String, required: true, trim: true }, // Example: "150 kW"

    pricing_per_kWh: { type: Number, required: true, min: 0 }, // Prevent negative values

    availability: { type: String, required: true, trim: true }, // Example: "24/7" or specific hours

    about: { type: String, required: true, trim: true }, // Station description

    // 📍 Address & Location Details
    address: {
        line1: { type: String, required: true, trim: true },
        line2: { type: String, required: true, trim: true }
    },

    // 📅 Date Added (ISO Format for better handling)
    date: { type: Date, default: Date.now },

    // 🕒 Slots Booked (Will store booking data)
    slots_booked: { type: Map, of: [String], default: {} } // Example: {"2024-07-25": ["8:30 PM", "9:30 PM"]}
}, { minimize: false });

// ✅ Model Creation
const stationModel = mongoose.models.Station || mongoose.model('Station', stationSchema);

export default stationModel;
