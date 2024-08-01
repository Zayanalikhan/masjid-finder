import getNearbyMosques from '../services/nearbyMasjidService.js';
import Masjid from '../models/masjidModel.js';

export const getNearbyMasjids = async (req, res) => {

  const { longitude, latitude } = req.query;

  if (!longitude || !latitude) {

    return res.status(400).send('Longitude and latitude are required.');

  }

  // Convert latitude and longitude from strings to numbers

  const lat = parseFloat(latitude);

  const lng = parseFloat(longitude);

  console.log(`Searching for mosques at latitude: ${lat}, longitude: ${lng}`);

  try {

    // Query the database to find mosques within a certain range of the provided coordinates

    const existingMosques = await Masjid.find({

      'location.latitude': { $gte: lat - 0.05, $lte: lat + 0.05 },

      'location.longitude': { $gte: lng - 0.05, $lte: lng + 0.05 },

    });

    // If mosques are found in the database, return them in the response

    if (existingMosques.length > 0) {

      console.log('Found mosques in database:');

      return res.json(existingMosques);

    }

    // If no mosques are found in the database, fetch nearby mosques from Google Places API

    console.log('No mosques found in the database. Fetching from Google Places API...');

    const nearbyMosques = await getNearbyMosques(lat, lng);

    console.log('Fetched nearby mosques from Google Places API:');

    // Filter out the mosques that are already present in the database

    const placeIds = new Set(existingMosques.map(mosque => mosque.placeId));

    const newMosques = nearbyMosques.filter(mosque => !placeIds.has(mosque.placeId));

    // Insert the new mosques into the database if there are any


    if (newMosques.length > 0) {

      // Add default prayer timings to new mosques

      const mosquesWithTimings = newMosques.map(mosque => ({

        ...mosque,

        prayerTimings: {

          fajr: '04:30',

          dhuhr: '12:30',

          asr: '15:30',

          maghrib: '18:30',

          isha: '20:00'

        }

      }));

      await Masjid.insertMany(mosquesWithTimings, { ordered: false }); // Use { ordered: false } to prevent stopping on errors

      console.log('Inserted new mosques with default prayer timings into the database:');

      res.json(mosquesWithTimings)

    } else {

      console.log('No new mosques to insert.');

    }

  } catch (error) {

    console.error('Error fetching nearby masjids:', error);

    if (!res.headersSent) {

      res.status(500).send('Error fetching nearby masjids');

    }

  }

};

export const deleteData = async (req, res) => {

  try {

    const deleteResult = await Masjid.deleteMany({});

    console.log(`${deleteResult.deletedCount} documents deleted.`);

    res.status(200).json({ message: 'All masjids deleted successfully' });

  } catch (err) {

    console.error('Error deleting masjids:', err);  // Log the error for debugging

    res.status(500).json({ error: 'Failed to delete masjids', details: err.message });

  }

}

export const deleteDataById = async (req, res) => {

  const { id } = req.params;

  if (!id) {

    return res.status(400).json({ error: 'ID parameter is required' });

  }

  try {

    const deleteResult = await Masjid.findByIdAndDelete(id);

    if (!deleteResult) {

      return res.status(404).json({ error: 'Masjid not found' });

    }

    console.log(`Masjid with ID ${id} deleted.`);

    res.status(200).json({ message: `Masjid with ID ${id} deleted successfully` });

  } catch (err) {

    console.error('Error deleting masjid:', err);

    res.status(500).json({ error: 'Failed to delete masjid', details: err.message });

  }
};

export const addMasjidImage = async (req, res) => {

  const { masjidId, imageBase64 } = req.body;

  try {

    const masjid = await Masjid.findById(masjidId);

    if (!masjid) {

      return res.status(404).json({ error: 'Masjid not found' });

    }

    if (!req.user || !req.user.id) {

      return res.status(403).json({ error: 'User not authenticated' });

    }

    if (!masjid.adminId) {

      console.log('adminId is missing or undefined:', masjid.adminId);

      return res.status(400).json({ error: 'Masjid does not have an admin' });

    }

    if (masjid.adminId.toString() !== req.user.id.toString()) {

      return res.status(403).json({ error: 'Access denied, only the masjid admin can add an image' });

    }

    const imageBuffer = Buffer.from(imageBase64, 'base64');

    const imagePath = path.join('uploads', `${Date.now()}_${masjidId}.jpg`);

    fs.writeFileSync(imagePath, imageBuffer);

    masjid.imagePath = imagePath;

    await masjid.save();

    res.status(200).json({ message: 'Masjid image uploaded successfully', imagePath });

  } catch (error) {

    console.error('Error adding masjid image:', error);

    res.status(500).json({ error: 'Server error' });

  }

};