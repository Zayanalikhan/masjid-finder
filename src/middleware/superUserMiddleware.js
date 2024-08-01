import User from '../models/userModel.js';

const authorizeSuperuser = async (req, res, next) => {

  try {

    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'superuser') {

      return res.status(403).json({ error: 'Access denied' });

    }

    next();

  } catch (error) {

    console.error('Error authorizing superuser:', error);

    res.status(500).json({ error: 'Server error' });

  }

};

export default authorizeSuperuser;
