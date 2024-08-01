import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Masjid from '../models/masjidModel.js'
import Request from '../models/requestModel.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_TOKEN

export const registerUser = async (req, res) => {

  if (req.user && req.user.role === 'guest') {

    return res.status(403).json({ error: 'Guests cannot register a user' });

  }

  const { username, phoneNumber, email, password } = req.body;

  try {

    const existingUser = await User.findOne({ username });

    if (existingUser) {

      return res.status(400).json({ error: 'User already exists' });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({

      username,

      phoneNumber,

      email,

      password: hashedPassword,

      role: 'user',

    });

    const plainpassword = password

    await user.save();

    res.status(201).json({

      message: 'User registered successfully',

      user: {

        id: user._id,

        username: user.username,

        phoneNumber: user.phoneNumber,

        email: user.email,

        password: plainpassword,

        role: user.role

      },

    });

  } catch (error) {

    console.error('Error registering user:', error);

    res.status(500).json({ error: error });

  }

}

export const loginUser = async (req, res) => {

  const { phoneNumber, password } = req.body;

  try {

    // Find user by username

    const user = await User.findOne({ phoneNumber });

    if (!user) {

      console.error('User not found');

      return res.status(400).json({ error: 'Invalid phone number or password' });

    }

    // Compare password with the hashed password

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      console.error('Password does not match');

      return res.status(400).json({ error: 'Invalid credentials' });

    }

    const plainpassword = password

    // Generate JWT token

    const token = jwt.sign(

      { id: user._id, username: user.username },

      JWT_SECRET,

      {

        expiresIn: '1h', // Set token expiration as needed

      }

    );

    res.json({

      message: 'User login successfully',

      user: {

        phoneNumber: user.phoneNumber,

        password: plainpassword,

        token: token

      },

    });

  } catch (error) {

    console.error('Error logging in:', error);

    res.status(500).json({ error: 'Server error' });

  }

};

export const claimMasjidOwnership = async (req, res) => {

  const { masjidId, documentBase64, documentType, cnic } = req.body;

  try {

    const masjid = await Masjid.findById(masjidId);

    if (!cnic) {

      return res.status(400).json({ error: 'CNIC is required' });

    }

    if (!masjid) {

      return res.status(404).json({ error: 'Masjid not found' });

    }

    if (masjid.adminId) {

      return res.status(400).json({ error: 'Masjid already has an admin' });

    }

    const user = await User.findById(req.user.id);

    if (!user) {

      return res.status(404).json({ error: 'User not found' });

    }

    if (user.role === 'superuser') {

      return res.status(403).json({ error: 'Superuser cannot claim ownership' });

    }

    if (user.masjidId) {

      return res.status(400).json({ error: 'You already have an assigned masjid or pending request' });

    }

    // Decode the Base64 document

    const documentBuffer = Buffer.from(documentBase64, 'base64');

    const documentPath = path.join('uploads', `${Date.now()}_${masjidId}.${documentType}`);


    // Save the file to disk

    fs.writeFileSync(documentPath, documentBuffer);

    await User.findByIdAndUpdate(req.user.id, {

      masjidId: masjidId,

      requestStatus: 'pending',

      documentPath: documentPath,

      cnic: cnic,

    }, { new: true });

    const newRequest = new Request({

      userId: user._id,

      masjidId,

      requestStatus: 'pending',

      documentPath,

      cnic

    });

    await newRequest.save();

    await user.save();

    res.status(200).json({ message: 'Masjid ownership request submitted successfully' });

  } catch (error) {

    console.error('Error claiming masjid ownership:', error);

    res.status(500).json({ error: error });

  }

};

export const handleOwnershipRequest = async (req, res) => {

  const { requestId, action } = req.body; // action can be 'approve' or 'reject'

  try {

    const request = await Request.findById(requestId).populate('userId');

    if (!request) {

      return res.status(404).json({ error: 'Request not found' });

    }

    const user = request.userId;

    const masjid = await Masjid.findById(request.masjidId);;

    if (action === 'approve') {

      if (!masjid) {

        return res.status(404).json({ error: 'Masjid not found' });

      }

      if (masjid.adminId) {

        return res.status(400).json({ error: 'Masjid already has an admin' });

      }

      masjid.adminId = user._id;

      user.role = 'admin';

      request.requestStatus = 'approved';

      await masjid.save();

    } else if (action === 'reject') {

      user.masjidId = null;

      user.requestStatus = 'rejected';

    } else {

      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });

    }

    await user.save();

    await request.save();

    res.status(200).json({ message: `Masjid ownership request ${action}ed successfully` });

  } catch (error) {

    console.error('Error handling ownership request:', error);

    res.status(500).json({ error: error });

  }

};

export const viewRequests = async (req, res) => {

  try {

    const requests = await Request.find().populate('userId').populate('masjidId');

    const requestDetails = requests.map(request => {

      const documentData = request.documentPath

        ? fs.readFileSync(request.documentPath, { encoding: 'base64' })

        : null;

      return {

        requestId: request._id,

        userId: request.userId._id,

        masjidId: request.masjidId._id,

        requestStatus: request.requestStatus,

        documentData,

        documentType: path.extname(request.documentPath || '').slice(1)

      };

    });

    res.status(200).json({ requests: requestDetails });

  } catch (error) {

    console.error('Error viewing requests:', error);

    res.status(500).json({ error: 'Server error' });

  }

};

