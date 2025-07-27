const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { MIMEType } = require('util');

// Disable caching (Causing trouble with jpeg files locally ...
// ... may also not be necessary for what we are doing)
sharp.cache(false);


// Universal path to where all pictures are uploaded to
const picturePath = path.join(__dirname,"../private/uploads");



/*
    +===+ Profile Pictures Middleware +===+
*/

// Delete the old profile picture of the user (Before uploading the new one)
const removeOldProfilePic = async (req,res,next) => {

    // Skip this step if the user does not have a pfp yet
    if (req.session.user.profile_picture == null) {
        return next();
    }


    const oldImagePath = path.join(picturePath,"profiles", req.session.user.profile_picture);

    if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old profile picture:', err);
        });
    }

    next();
};


// Resize the current uploaded profile picture to a website-friendly size
const resizeProfilePic = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }    
    
    try {
        // Create a smaller PNG version of the orignal upload
        const resizedPFP = await sharp(req.file.buffer)
            .resize(400, 400)
            .toFormat('png')
            .png({ quality: 80 })
            .toBuffer();

        // Create incomplete name with unique identifier before being processed
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newName = `profilePic-${uniqueSuffix}.png`;
        

        // Store new PFP in the req object
        req.processedPFP = {
            filename: newName,
            buffer: resizedPFP
        };
    } catch (err) {
      console.error('Error resizing image:', err);
      return res.status(500).send("Failed to resize image");
    }    

    next();
};





/*
    +===+ Listing Pictures Middleware +===+
*/

const createThumbnails = async (req, res, next) => { 
    try {
        // Resize all of the images provided in the batch, and compile them
        // into a collection with the originals
        req.processedImages = await Promise.all(
            req.files.map(async (file) => {
                const thumbBuffer = await sharp(file.buffer)
                    .resize(300, 300)
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toBuffer();

                // Create name for the current picture
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const orgExt = path.extname(file.originalname);
                const orgName = `listingOrg-${uniqueSuffix}${orgExt}`;
                const thumbName = `listingThumb-${uniqueSuffix}.jpeg`;

                // Pack original and thumbnail for the image
                return {
                    originalName: orgName,
                    original: file.buffer,
                    thumbName: thumbName,
                    thumb: thumbBuffer
                }
            })
        )
    } catch (err) {
        console.error('Error resizing batch of images:', err);
        return res.status(500).send("Failed to resize batch of images");
    } 

    next();
};

module.exports = {
    removeOldProfilePic,
    resizeProfilePic,
    createThumbnails
};