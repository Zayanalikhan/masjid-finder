import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const guestMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {

    // If there's no authorization header, assign a guest role

    const guestId = crypto.randomBytes(16).toString('hex');

    req.user = { id: guestId, role: 'guest' };

  } else {

    // Verify JWT token

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

      if (err) {

        return res.status(403).json({ error: 'Invalid token' });

      }

      req.user = user;

    });

  }

  next();

};
