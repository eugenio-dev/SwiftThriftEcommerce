const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { debugUpload } = require('../middleware/sessionMiddleware');
const { updateProfilePicPath } = require('../database/queries/usersQueries');
const { removeOldProfilePic, resizeProfilePic } = require('../middleware/pictureMiddleware');



// Create profiles directory if not exists
const uploadDir = path.join(__dirname, '../private/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create multer upload instance
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});


router.post('/upload-profile-picture', debugUpload, removeOldProfilePic, upload.single('profileImage'), 
              resizeProfilePic,  async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(403).send("Not authorized");
  }

  // Then, we create the image into the file system
  fs.writeFileSync(`${uploadDir}/${req.processedPFP.filename}`, req.processedPFP.buffer);

  // Afterwards, we link the path to the database
  const rows = await updateProfilePicPath(req.session.user.id, req.processedPFP.filename);

  if (rows.changedRows < 1) {
    res.status(500).send("Error saving profile picture");
  }

  // Finally, we set the field in the session
  req.session.user.profile_picture = req.processedPFP.filename;
  res.redirect('/profile');
});

module.exports = router;
