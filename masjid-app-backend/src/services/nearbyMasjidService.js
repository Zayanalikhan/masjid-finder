import axios from 'axios';
import 'dotenv/config';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const getNearbyMosques = async (lat, lng) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 5000,
        type: 'mosque',
        key: GOOGLE_API_KEY,
      },
    });

    const mosques = response.data.results.map(place => ({
      name: place.name,
      address: place.vicinity,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      },
    }));

    return mosques;
  } catch (error) {
    console.error('Error fetching nearby mosques:', error);
    throw new Error('An error occurred while fetching nearby mosques');
  }
};

export default getNearbyMosques;
