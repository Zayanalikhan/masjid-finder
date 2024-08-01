import express from 'express';
import { registerUser, loginUser, claimMasjidOwnership, handleOwnershipRequest, viewRequests } from '../controllers/userController.js'
import authMiddleware from '../middleware/authenticationMiddleware.js';
import superUserMiddleware from '../middleware/superUserMiddleware.js';
import { guestMiddleware } from '../middleware/guestUserMiddleware.js';

const router = express.Router();

router.post('/register', guestMiddleware, registerUser);

router.post('/login', guestMiddleware, loginUser);

router.post('/claim-masjid', authMiddleware, claimMasjidOwnership);

router.get('/requests', authMiddleware, superUserMiddleware, viewRequests);

router.put('/handle-request', authMiddleware, superUserMiddleware, handleOwnershipRequest);

export default router;
