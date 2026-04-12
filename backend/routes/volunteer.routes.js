import express from "express"
import { volunteerSaveTokenController } from "../controller/volunteer.controller.js";
import { volunteerProtectedRoute } from "../middleware/protectedRoute.js";

const volunteerRouter = express.Router();

volunteerRouter.post('/save-token/:token', volunteerProtectedRoute, volunteerSaveTokenController)

export default volunteerRouter;