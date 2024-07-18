import express from 'express'
import { getNearbyMasjids } from '../controllers/masjidController.js';

const masjidRoutes = express.Router();

masjidRoutes.get('/nearby-masjids', getNearbyMasjids);

export default masjidRoutes
