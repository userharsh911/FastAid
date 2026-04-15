import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

const VOLUNTEER_PASSWORD_RESET_TOKEN_PURPOSE = "volunteer-password-reset";

export const createJSONwebToken = (email)=>{
    const token = jwt.sign({email},process.env.JWT_SECRET,{expiresIn: '7d'});
    return token;
}

export const verifyJSONwebToken = (token)=>{
    return jwt.verify(token,process.env.JWT_SECRET);
}

export const createVolunteerPasswordResetToken = (email) => {
    return jwt.sign(
        { email, purpose: VOLUNTEER_PASSWORD_RESET_TOKEN_PURPOSE },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
}

export const verifyVolunteerPasswordResetToken = (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload?.purpose !== VOLUNTEER_PASSWORD_RESET_TOKEN_PURPOSE) {
        throw new Error("Invalid password reset token");
    }

    return payload;
}