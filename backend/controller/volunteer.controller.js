import Volunteer from "../model/volunteer.model.js";

export const volunteerSaveTokenController = async(req,res)=>{
    try {
        const { token: pushToken } = req.body;
        const userId = req.volunteer._id;

        if (!pushToken) {
            return res.status(400).json({ success: false, message: "Push token is required" });
        }

        await Volunteer.findByIdAndUpdate(userId, { push_token: pushToken });
        res.send({ success: true });
    } catch (error) {
        console.log("Error while save notification token ",error);
        return res.status(500).json({success:false,message:"Internal server error"})
    }
}