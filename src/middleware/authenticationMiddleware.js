import jwt from 'jsonwebtoken';
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_TOKEN

const authMiddleware = (req, res, next) => {

  const authHeader = req.header('Authorization');
  
  if (!authHeader) {

    return res.status(401).json({ error: 'Access denied, no token provided' });
    
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {

    return res.status(401).json({ error: 'Access denied, no token provided' });

  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {

    res.status(400).json({ error: 'Invalid token' });

  }

};

export default authMiddleware;
