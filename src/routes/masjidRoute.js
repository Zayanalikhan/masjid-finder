import express from 'express'
import { getNearbyMasjids, deleteData, deleteDataById, addMasjidImage } from '../controllers/masjidController.js';
import  { getPrayerTimings, insertPrayer, updatePrayerTiming } from '../controllers/PrayerTimingsController.js';
import authMiddleware from '../middleware/authenticationMiddleware.js';
import authorizeAdmin from '../middleware/authorizationMiddleware.js';

const router = express.Router();

router.get('/nearby-masjids', getNearbyMasjids);

router.delete('/delete-masjid', deleteData);

router.delete('/delete-masjid/:id', deleteDataById);

router.get('/prayer-timings/:masjidId', getPrayerTimings);

router.post('/insert-timing', authMiddleware, authorizeAdmin, insertPrayer);

router.put('/update-timing', authMiddleware, authorizeAdmin, updatePrayerTiming);

router.post('/add-masjid-image', authMiddleware, addMasjidImage); 

export default router