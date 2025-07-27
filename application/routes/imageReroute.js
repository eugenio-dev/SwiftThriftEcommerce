const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

/*
  Two separate paths for pictures:
    1. private/uploads for images uploaded by userse
    2. public/images for the website's images
*/
const uploadedPicPath = path.join(__dirname,"../private/uploads");
const defaultImagePath = path.join(__dirname,"../public/images");

/*
    Change how ESJ templates access
*/

router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;

  // Prevent directory traversal attacks
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).send('Invalid filename');
  }

  // Determine path to look by name of file
  var filePath;
  if (filename.startsWith('listingOrg-')) {
    filePath = path.join(uploadedPicPath, 'listings','original', filename);
  } else if (filename.startsWith('listingThumb-')) {
    filePath = path.join(uploadedPicPath, 'listings','thumbnail', filename);
  } else if (filename.startsWith('profilePic-')) {
    filePath = path.join(uploadedPicPath, 'profiles', filename);
  } else {
    filePath = path.join(defaultImagePath, filename);
  }
  //console.log(`filepath for ${filename}: ${filePath}`);

  // Give the picture if it exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('Picture not found');
    res.sendFile(filePath);
  });
});


module.exports = router;