import express from "express";
import masjidRoutes from "./masjidRoute.js";
import userRoutes from "./userRoute.js";

const router = express.Router();

router.use('/api', masjidRoutes);

router.use('/api/user', userRoutes);

export default router;
