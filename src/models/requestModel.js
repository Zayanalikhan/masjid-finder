import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({

  userId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',

    required: true,

  },

  masjidId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Masjid',

    required: true,

  },

  requestStatus: {

    type: String,

    enum: ['pending', 'approved', 'rejected'],

    default: 'pending',

  },

  documentPath: {

    type: String

  },

  cnic: {

    type: String,

    required: true

  }

});

const Request = mongoose.model('Request', requestSchema);

export default Request;
