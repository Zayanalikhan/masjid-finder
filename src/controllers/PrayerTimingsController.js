import Masjid from '../models/masjidModel.js';
import PrayerTiming from '../models/prayerTimingModel.js';

export const getPrayerTimings = async (req, res) => {

  const { masjidId } = req.params;

  try {

    const masjid = await Masjid.findById(masjidId);

    if (!masjid) {

      return res.status(404).json({ error: 'Masjid not found' });

    }

    const timings = await PrayerTiming.findOne({ masjidId });

    if (!timings) {

      return res.status(404).json({ error: 'Prayer timings not found for this masjid' });

    }

    res.status(200).json(timings);

  } catch (error) {

    console.error('Error fetching prayer timings:', error);

    res.status(500).json({ error: 'Server error' });

  }
  
};

export const insertPrayer = async (req, res) => {

  const { masjidId, ...timings } = req.body;

  try {

    const masjid = await Masjid.findById(masjidId);

    if (!masjid) {

      return res.status(404).json({ error: 'Masjid not found' });

    }

    // Retrieve existing prayer timings or initialize an empty object

    const existingTimings = masjid.prayerTimings || new Map();

    // Check if any of the provided timings already exist

    const existingKeys = Object.keys(timings).filter(prayer => existingTimings.has(prayer));

    if (existingKeys.length > 0) {

      // Check if any existing timing values are different

      const differentValues = existingKeys.filter(prayer => existingTimings.get(prayer) !== timings[prayer]);

      if (differentValues.length > 0) {

        return res.status(400).json({ error: 'If you want to modify, go to the update prayer timings endpoint' });
      }

      return res.status(400).json({ error: 'No new prayer timings to add. All provided timings already exist.' });
    }

    // Insert new prayer timings

    const prayerTiming = new PrayerTiming({

      masjidId,

      timings,

    });

    await prayerTiming.save();

    // Update masjid's prayerTimings with new keys

    Object.entries(timings).forEach(([key, value]) => {

      masjid.prayerTimings.set(key, value);

    });

    const updatedMasjid = await masjid.save();

    res.status(201).json({

      message: 'Prayer timing added successfully',

      updatedMasjid,

    });

  } catch (error) {

    console.error('Error inserting prayer timing:', error);

    res.status(500).json({ error: 'Server error' });

  }

};

export const updatePrayerTiming = async (req, res) => {

  const { masjidId, ...timings } = req.body;

  try {

    const masjid = await Masjid.findById(masjidId);

    if (!masjid) {

      return res.status(404).json({ error: 'Masjid not found' });

    }

    // Retrieve existing prayer timings

    const existingTimings = masjid.prayerTimings || new Map();

    // Check if all provided timings are existing

    const providedKeys = Object.keys(timings);

    const existingKeys = [...existingTimings.keys()];

    const newKeys = providedKeys.filter(prayer => !existingKeys.includes(prayer));

    if (newKeys.length > 0) {

      return res.status(400).json({

        error: 'If you want to add new prayer timings, go to the insert prayer timings endpoint'

      });

    }

    // Update existing prayer timings

    providedKeys.forEach(prayer => {

      if (existingTimings.has(prayer)) {

        existingTimings.set(prayer, timings[prayer]);

      }

    });

    // Save the updated masjid document

    masjid.prayerTimings = existingTimings;

    const updatedMasjid = await masjid.save();

    // Update the PrayerTiming document

    const updatedPrayerTiming = await PrayerTiming.findOneAndUpdate(

      { masjidId },

      { $set: timings },

      { new: true }

    );

    if (!updatedPrayerTiming) {

      return res.status(404).json({ error: 'Prayer timings document not found for this masjid' });

    }

    res.status(200).json({

      message: 'Prayer timings updated successfully',

      updatedMasjid

    });

  } catch (error) {

    console.error('Error updating prayer timing:', error);

    res.status(500).json({ error: 'Server error' });

  }

};


