import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({

    username: {

        type: String,

        required: true,

        unique: true,

    },

    phoneNumber: {

        type: String,

        required: true,

        unique: true,

    },

    email: {

        type: String,

        unique: true,

        sparse: true, // This ensures email is unique if provided but allows multiple users without an email

    },

    password: {

        type: String,

        required: true,

    },

    role: {

        type: String,

        enum: ['guest', 'user', 'admin', 'superuser'],

        default: 'user'

    },

    masjidId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'Masjid',

        required: false

    },

    requestStatus: {

        type: String,

        enum: ['pending', 'approved', 'rejected'],

        default: 'pending',

        required: false

    },

    documentPath: {

        type: String,

        required: false

    },

    cnic: {

        type: String,

        required: false

    }

});

const User = mongoose.model('User', userSchema);

export default User;
