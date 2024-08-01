import mongoose from 'mongoose';

const MasjidSchema = new mongoose.Schema({

  name: {

    type: String,

    required: true

  },

  address: {

    type: String,

    required: true

  },

  location: {

    latitude: { type: Number, required: true },

    longitude: { type: Number, required: true },

  },

  placeId: {

    type: String,

    unique: true,

  },

  prayerTimings: {

    type: Map,

    of: String,

    default: {},

  },

  adminId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User'

  },

  imagePath: {

    type: String

  },

});

MasjidSchema.index({ location: '2dsphere' });

const Masjid = mongoose.model('Masjid', MasjidSchema);

export default Masjid;
