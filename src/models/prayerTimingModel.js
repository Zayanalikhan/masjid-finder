import mongoose from 'mongoose';

const prayerTimingsSchema = new mongoose.Schema({

    masjidId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'Masjid',

        required: true

    },

    timings: {

        type: Map,

        of: String,

        required: true

    },

});

const PrayerTiming = mongoose.model('PrayerTiming', prayerTimingsSchema);

export default PrayerTiming;
