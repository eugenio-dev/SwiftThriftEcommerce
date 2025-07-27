const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { addListing } = require('../database/queries/listingsQueries'); 
const { savePicture } = require('../database/queries/picturesQueries');
const { createThumbnails } = require('../middleware/pictureMiddleware');
const { pool } = require('../database/connection');



// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../private/uploads/listings');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Additionally, create the subdirectories, original and thumbnail
const thumbDir = path.join(uploadDir, '/thumbnail');
if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}
const originalDir = path.join(uploadDir, '/original');
if (!fs.existsSync(originalDir)) {
  fs.mkdirSync(originalDir, { recursive: true });
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





// POST route to create a new listing with images
router.post('/create', upload.array('images', 5), createThumbnails, async (req, res) => {
  try {

    console.log("Form data received:", req.body);
    console.log("Files received:", req.files ? req.files.length : 0);
    
    // Get form data from request body
    const { title, price, category, description } = req.body;
    const uploadedFiles = req.processedImages || [];
    
    // Validate required fields
    if (!title || !price || !category || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required' 
      });
    }
    
    // Get the current user ID
    const sellerId = req.session.user.id;
    
    // Insert listing into database
    const listingResult = await addListing(
      sellerId,
      category,
      title,
      description,
      parseFloat(price)
    );
    
    if (!listingResult || !listingResult.insertId) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create listing'
      });
    }
    
    const listingId = listingResult.insertId;
   
    // Handle availability input for services
    if (parseInt(category) === 3 && req.body.availability) {
      const availability = JSON.parse(req.body.availability);

      for (const slot of availability) {
        await pool.query(
          `INSERT INTO availability (service_id, available_date, start_time, end_time)
          VALUES (?, ?, ?, ?)`,
          [listingId, slot.date, slot.start, slot.end]
        );
      }
    }
  
    
    // Now handle image uploads
    // For each uploaded file, save in file system AND insert into pictures table
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const displayOrder = req.body.displayOrder ? parseInt(req.body.displayOrder[i], 10) : i;

      fs.writeFileSync(`${originalDir}/${file.originalName}`, file.original);
      fs.writeFileSync(`${thumbDir}/${file.thumbName}`, file.thumb);
      
      // Insert picture info into database
      const rows = await savePicture(
        listingId,
        file.originalName,
        file.thumbName,
        displayOrder
      );
    }
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listingId
    });
    
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message
    });
  }
});



module.exports = router;