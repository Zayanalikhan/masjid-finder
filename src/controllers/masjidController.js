import Masjid from '../models/masjidModel.js';
import getNearbyMosques from '../services/nearbyMasjidService.js';

const getNearbyMasjids = async (req, res) => {
  const { longitude, latitude } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).send('Longitude and latitude are required.');
  }

  try {
    // Fetch nearby mosques from Google Places API
    const nearbyMosques = await getNearbyMosques(latitude, longitude);

    // Update or insert masjids into the database
    await Promise.all(
      nearbyMosques.map(async mosque => {
        await Masjid.findOneAndUpdate(
          { name: mosque.name },
          { $setOnInsert: { ...mosque, location: { type: 'Point', coordinates: [mosque.location.lng, mosque.location.lat] } } },
          { upsert: true, new: true }
        );
      })
    );

    // Fetch all nearby masjids from the database
    const nearbyMasjids = await Masjid.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            5 / 3963.2, // 5 miles converted to radians
          ],
        },
      },
    });

    // Extract only necessary fields for response
    const formattedMasjids = nearbyMasjids.map(masjid => ({
      name: masjid.name,
      address: masjid.address,
      location: {
        latitude: masjid.location.coordinates[1],
        longitude: masjid.location.coordinates[0],
      },
    }));

    res.json(formattedMasjids);
  } catch (error) {
    console.error('Error fetching nearby masjids:', error);
    res.status(500).send('Error fetching nearby masjids');
  }
};

export { getNearbyMasjids };
