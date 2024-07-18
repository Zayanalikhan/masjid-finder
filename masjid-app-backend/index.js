import express from 'express';
import mongoose from 'mongoose';
import masjidRoutes from './src/routes/masjidRoute.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_DB_URI, {
  ssl: true,
  tlsAllowInvalidCertificates: true, 
  tlsAllowInvalidHostnames: true,   
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Connection error:', error);
});

app.use('/api', masjidRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
