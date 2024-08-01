import User from '../models/userModel.js';

const authorizeAdmin = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {

            console.log('User not found');

            return res.status(403).json({ error: 'User is not authorized' });

        }

        if (!user.isAdmin) {

            console.log('User is not an admin');

            return res.status(403).json({ error: 'User is not authorized' });

        }

        if (user.masjidId.toString() !== req.body.masjidId) {

            console.log('User masjidId does not match request body masjidId');

            console.log('User masjidId:', user.masjidId.toString());

            console.log('Request body masjidId:', req.body.masjidId);

            return res.status(403).json({ error: 'User is not authorized' });

        }

        next();

    } catch (error) {

        console.error('Server error:', error);

        res.status(500).json({ error: 'Server error' });

    }

};

export default authorizeAdmin;
