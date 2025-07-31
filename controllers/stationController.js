import stationModel from "../models/stationModel.js";

// ✅ FIXED: Added req, res parameters
const stationList = async (req, res) => {
    try {
        const stations = await stationModel.find({}).select(['-password', '-email']);
        res.status(200).json({ success: true, stations }); // ✅ Send JSON response properly
    } catch (error) {
        console.log("🚨 Error fetching stations:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export { stationList };

