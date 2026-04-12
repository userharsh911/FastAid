import express from "express"
import { createAlertController } from "../controller/alert.controller.js";
import { userProtectedRoute } from "../middleware/protectedRoute.js";

const alertRouter = express.Router();

// token route for logged-in users
alertRouter.post('/create/:token', userProtectedRoute, createAlertController);
// fallback route for guest users (as_guest id in body)
alertRouter.post('/create', userProtectedRoute, createAlertController);

export default alertRouter