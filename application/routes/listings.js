const express = require('express');
const router = express.Router();
const { getCategories, searchListings, getAllListings } = require('../database/queries/searchQueries');
const { validSearch, trimSearch } = require('../middleware/searchMiddleware');
// Add import for the listingsModel
const listingsModel = require('../database/queries/listingsQueries');

// Route for getting all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'An error occurred while fetching categories' });
  }
});

// Route for searching listings
router.get('/listings/search', validSearch, trimSearch, async (req, res) => {
  try {
    const { category, query } = req.query;
    const listings = await searchListings(category, query);
    
    res.json({
      count: listings.length,
      listings
    });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
});

// Route for getting all listings
router.get('/listings/search', validSearch, trimSearch, async (req, res) => {
  try {
    const { category, query } = req.query;
    const listings = await searchListings(category, query);
    
    res.json({
      count: listings.length,
      listings
    });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
});

// Route for getting all listings
router.get('/listings', async (req, res) => {
  try {
      const allListings = await getAllListings();
      
      res.json({
        count: allListings.length,
        listings: allListings
      });
  } catch (error) {
    console.error('Error retrieving listings: of user', error);
    res.status(500).json({ error: 'An error occurred while retrieving listings of user' });
  }
});

// Route for user's listings
router.get('/mylistings', async (req, res) => {
  try {
    // Check if user is requesting their own listings
    const userId = req.session?.user?.id;
    
    console.log('Session user:', req.session?.user);
    console.log('User ID:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const userListings = await listingsModel.getListingsByUser(userId);
    console.log(`Found ${userListings.length} listings for user ${userId}`);
      
    res.json({
      count: userListings.length,
      listings: userListings
    });
  } catch (error) {
    console.error('Error retrieving listings: of user', error);
    res.status(500).json({ error: 'An error occurred while retrieving listings of user' });
  }
});

// Endpoint to update listing status
router.put('/listings/:id/status', async (req, res) => {
  const listingId = req.params.id;
  const { status } = req.body;
  const userId = parseInt(req.session?.user?.id); 

  if (!userId) {
    return res.status(401).json({ error: 'User not logged in' });
  }
  
  try {
    // Verify this listing belongs to the user
    const listing = await listingsModel.getListing(listingId);

    if (!listing || listing[0].seller_id != userId) {
      return res.status(403).json({ error: 'Not authorized to modify this listing' });
    }
    
    // Update the status
    await listingsModel.changeListingStatus(listingId, status);
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({ error: 'Failed to update listing status' });
  }
});

module.exports = router;