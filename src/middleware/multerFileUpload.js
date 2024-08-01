import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, 'uploads/'); // Specify the upload directory

  },

  filename: function (req, file, cb) {

    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename

  }

});

const fileFilter = (req, file, cb) => {

  // Adjust MIME types as needed

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(new Error('Invalid file type, only PDF, JPEG, and PNG are allowed'), false);

  }

};

// Initialize multer with storage and file filter

const upload = multer({ storage, fileFilter });

export default upload;
