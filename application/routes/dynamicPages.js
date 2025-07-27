const express = require('express');
const router = express.Router();
const { getServiceById } = require('../database/queries/searchQueries'); 


const { pool } = require('../database/connection');
const {
  getCategoryName,
  getTop3,
  searchListings,
  getListingById
} = require('../database/queries/searchQueries');
const { getListing } = require('../database/queries/listingsQueries')
const { getPictures } = require('../database/queries/picturesQueries');

// Apply middleware for checking through different webpages
// Store sessions data to local so EJS template can use them
const { userDataInLocal } = require('../middleware/sessionMiddleware');
// Check if current session's age is greater than 15 minutes ...
// Regenerate the session if that is the case
const { regenCheck } = require("../middleware/sessionMiddleware");
router.use(userDataInLocal, regenCheck);



router.get("/", async (req, res) => {
  try {
    const rows = await getTop3();

    res.render('index', {
      title: "Swift Thrift",
      listings: rows
    });

  } catch (error) {
    console.error("Error fetching top listings:", error);
    res.status(500).send("Error loading listings");
  }
});

router.get('/inbox', (req, res) => {
  res.render('inbox', {
    title: 'Inbox',
    userId: req.session.user.id
  });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/account-profile', (req, res) => {
  res.render('account-profile');
});

router.get('/category/:id', async (req, res) => {
  const categoryId = req.params.id;

  // Check if the category id is a valid integer
  const integerRegex = /^\d+$/
  if (!integerRegex.test(categoryId)) {
    return res.status(400).render('error', { message: 'Invalid category ID' });
  }

  try {
    const rows = await searchListings(categoryId, '');
    const categoryName = await getCategoryName(categoryId);

    // Renders the category page with the listings by categoryId
    res.render('category', { listings: rows, categoryName });
  } catch (error) {
    console.error("Error fetching listings for category:", error);
    res.status(500).send("Error loading category listings");
  }
});

router.get('/edit-listing', (req, res) => {
  res.render('edit-listing');
});

router.get('/product-page', (req, res) => {
  res.render('product-page');
});

router.get('/create-listing', (req, res) => {
  res.render('create-listing');
});

router.get('/listing-page', (req, res) => {
  res.render('listing-page');
});

// Route for a specific listing
router.get('/listing/:id', async (req, res) => {
  const listingId = req.params.id;

  // Check if the listing id is a valid integer
  const integerRegex = /^\d+$/
  if (!integerRegex.test(listingId)) {
    return res.status(400).render('error', { message: 'Invalid listing ID' });
  }

  try {
    // Get information about the listing
    const [listing] = await getListing(listingId);
    //console.log(listing);

    if (!listing || listing.listing_status != 'active') {
      return res.status(404).json({ error: 'Listing does not exist' });
    }

    // Get pictures associated with the listing
    const pictures = await getPictures(listingId);

    // Renders the page associated with either services or not
    if (listing.categoryId == 3) {
      res.render('services', { listing, pictures });
    } else {
      res.render('product-page', { listing, pictures });
    }


  } catch (error) {
    console.error('Error getting listing:', error);
    res.status(500).json({ error: 'Something went wrong fetching the listing' });
  }
});

router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('profile');
});




router.get('/service-calendar', (req, res) => {
  res.render('service-calendar');
// router.get('/service-calendar', (req, res) => {
// res.render('service-calendar');
});

router.get('/service/:id/calendar', async (req, res) => {
  const serviceId = req.params.id;

  try {
    const listing = await getServiceById(serviceId);

    if (!listing) {
      return res.status(404).send('Service not found');
    }

    res.render('service-calendar', { 
  listing,
  listing_id: listing.listing_id,              
  user_id: req.session?.user?.id || null
});

  } catch (error) {
    console.error('Error loading service calendar:', error);
    res.status(500).send('Server error');
  }
});


router.get('/services', (req, res) => {
  res.render('services');
});

router.get('/signup', (req, res) => {
  res.render('signup');

});

router.get('/results', async (req, res) => {
  res.render('results');
});


//This is to get the profile picture, seller info, and category name
// for the listing page
router.get('/api/listing/:id', async (req, res) => {
  const listingId = req.params.id;
  try {
    // Fetch the listing data (including seller_id)
    const [listing] = await getListing(listingId);

    if (!listing || listing.listing_status !== 'active') {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Fetch the seller info from users table
    const [sellerRows] = await pool.query(
      `SELECT firstName, lastName, profile_picture FROM users WHERE user_id = ?`,
      [listing.seller_id]
    );

    const seller = sellerRows[0] || {};
    // Fetch the category name from categories table
    const [categoryRows] = await pool.query(
      `SELECT category_name FROM categories WHERE category_id = ?`,
      [listing.category_id]
    );
    const category = categoryRows[0] || {};

    const pictures = await getPictures(listingId);

    // Attach seller info to the listing object
    listing.firstName = seller.firstName || 'Unknown';
    listing.lastName = seller.lastName || '';
    listing.profile_picture = seller.profile_picture || null;
    listing.category_name = category.category_name || 'Uncategorized';

    // Respond with the full listing including seller info
    res.json({ success: true, listing, pictures });
  } catch (error) {
    console.error('Error fetching listing with seller info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/api/availability/:serviceId', async (req, res) => {
  const serviceId = req.params.serviceId;

  try {
    const [rows] = await pool.query(`
      SELECT 
        availability_id, 
        available_date, 
        start_time, 
        end_time,
        is_booked
      FROM availability 
      WHERE service_id = ?
    `, [serviceId]);

    const grouped = {};

    for (let row of rows) {
      console.log("ROW:", row); 

      const label = new Date(row.available_date).toDateString();

      if (!grouped[label]) {
        grouped[label] = {
          label,
          availability_id: row.availability_id,
          status: "available",
          times: []
        };
      }

        grouped[label].times.push({
        time: `${row.start_time} - ${row.end_time}`,
        is_booked: row.is_booked === 1,
        availability_id: row.availability_id
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  router.post('/book', async (req, res) => {
    const { availabilityId, userId } = req.body;

    console.log("📌 Booking availability ID:", availabilityId);

    try {
      // Optioznal: log booking in a separate table too
      const [result] = await pool.query(`
        UPDATE availability 
        SET is_booked = TRUE 
        WHERE availability_id = ?
      `, [availabilityId]);

      console.log("Update result:", result);

      res.json({ message: 'Successfully booked your time!' });
    } catch (err) {
      console.error('Booking error:', err);
      res.status(500).json({ message: 'Booking failed. Try again later.' });
    }
  });


module.exports = router;

// GET calendar view for a specific service
// router.get('/service/:id/calendar', async (req, res) => {
//   const serviceId = req.params.id;
//   try {
//     const listing = await getServiceById(serviceId);
//     if (!listing) return res.status(404).send('Service not found');
//     res.render('service-calendar', { 
//       listing,
//       listing_id: listing.listing_id,
//       user_id: req.session?.user?.id || null
//     });
//   } catch (error) {
//     console.error('Error loading service calendar:', error);
//     res.status(500).send('Server error');
//   }
// });

// // API to get availability slots grouped by date
// router.get('/api/availability/:serviceId', async (req, res) => {
//   const serviceId = req.params.serviceId;
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         availability_id, 
//         available_date, 
//         start_time, 
//         end_time,
//         is_booked
//       FROM availability 
//       WHERE service_id = ?
//     `, [serviceId]);

//     const grouped = {};
//     for (let row of rows) {
//       const label = new Date(row.available_date).toDateString();
//       if (!grouped[label]) {
//         grouped[label] = {
//           label,
//           times: []
//         };
//       }
//       grouped[label].times.push({
//         time: `${row.start_time} - ${row.end_time}`,
//         is_booked: row.is_booked === 1,
//         availability_id: row.availability_id
//       });
//     }
//     res.json(Object.values(grouped));
//   } catch (err) {
//     console.error('Error fetching availability:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // POST booking request
// router.post('/book', async (req, res) => {
//   const { availabilityId, userId } = req.body;
//   try {
//     const [result] = await pool.query(`
//       UPDATE availability 
//       SET is_booked = TRUE 
//       WHERE availability_id = ?
//     `, [availabilityId]);

//     console.log("Booking result:", result);
//     res.json({ message: 'Successfully booked your time!' });
//   } catch (err) {
//     console.error('Booking error:', err);
//     res.status(500).json({ message: 'Booking failed. Try again later.' });
//   }
// });

module.exports = router;