import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    statId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    userData: { type: Object, required: true }, // ✅ Stores user details
    stationData: { type: Object, required: true }, // ✅ Stores station details
    slotData: { type: String, required: true }, // Example: "3_3_2025"
    slotTime: { type: String, required: true }, // Example: "04:00 AM"
    amount: { type: Number, required: true }, // Price per kWh
    createdAt: { type: Date, default: Date.now }, // ✅ Store when appointment was created
});

const appointmentModel = mongoose.models.Appointment || mongoose.model("appointment", appointmentSchema);
export default appointmentModel;
