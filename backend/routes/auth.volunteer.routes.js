import express from "express"
import { applyVolunteerController, getVolunteerController, loginVolunteerController, resendVolunteerOtpController, resetVolunteerForgotPasswordController, sendVolunteerForgotPasswordOtpController, verifyVolunteerForgotPasswordOtpController, verifyVolunteerOtpController } from "../controller/auth.volunteer.controller.js";
import { volunteerDocumentUploadMiddleware } from "../middleware/volunteerDocumentUpload.js";
import { volunteerProtectedRoute } from "../middleware/protectedRoute.js";

const volunteerAuthRouter = express.Router();

volunteerAuthRouter.post("/apply", volunteerDocumentUploadMiddleware, applyVolunteerController);
volunteerAuthRouter.post("/login",loginVolunteerController);
volunteerAuthRouter.post("/verify-otp", verifyVolunteerOtpController);
volunteerAuthRouter.post("/resend-otp", resendVolunteerOtpController);
volunteerAuthRouter.post("/forgot-password/send-otp", sendVolunteerForgotPasswordOtpController);
volunteerAuthRouter.post("/forgot-password/verify-otp", verifyVolunteerForgotPasswordOtpController);
volunteerAuthRouter.post("/forgot-password/reset", resetVolunteerForgotPasswordController);
volunteerAuthRouter.get("/:token",volunteerProtectedRoute,getVolunteerController);

export default volunteerAuthRouter;