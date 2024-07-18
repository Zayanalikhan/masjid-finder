import mongoose from 'mongoose';

const MasjidSchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
});

MasjidSchema.index({ location: '2dsphere' });

const Masjid = mongoose.model('Masjid', MasjidSchema);

export default Masjid;
