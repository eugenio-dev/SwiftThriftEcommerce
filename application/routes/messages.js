const express = require('express');
const router = express.Router();
const { pool } = require('../database/connection');

router.get('/message/:listingId', async (req, res) => {
  if (!req.session.user) {
    return res.redirect(`/login?redirect=/message/${req.params.listingId}`);
  }
  
  const listingId = req.params.listingId;
  
  try {
    // Get the listing details
    const [listings] = await pool.query(`
      SELECT l.*, u.user_id as seller_id, l.listing_name
      FROM listings l
      JOIN users u ON l.seller_id = u.user_id
      WHERE l.listing_id = ?
    `, [listingId]);
    
    if (listings.length === 0) {
      return res.redirect('/inbox');
    }
    
    const listing = listings[0];
    
    // Redirect to inbox with URL parameters
    res.redirect(`/inbox?listing=${listingId}&seller=${listing.seller_id}&name=${encodeURIComponent(listing.listing_name)}`);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.redirect('/inbox');
  }
});

router.get('/inbox', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login?redirect=/inbox');
  }
  
  // Get parameters from URL
  const listingId = req.query.listing || '';
  const sellerId = req.query.seller || '';
  const listingName = req.query.name || '';
  
  // Get seller name if needed
  let sellerName = '';
  if (sellerId && sellerId !== req.session.user.id) {
    try {
      const [users] = await pool.query(
        'SELECT firstName, lastName FROM users WHERE user_id = ?',
        [sellerId]
      );
      
      if (users.length > 0) {
        sellerName = `${users[0].firstName} ${users[0].lastName}`;
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
    }
  }
  
  // Render the inbox page with parameters
  res.render('pages/inbox', {
    userId: req.session.user.id,
    newListingId: listingId,
    newSellerId: sellerId,
    newSellerName: sellerName,
    newListingName: listingName
  });
});

//API to get all chats
router.get('/api/chats', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  try {
    const userId = req.session.user.id;
    
    // Get distinct conversations
    const [conversations] = await pool.query(`
      SELECT DISTINCT
        m.listing_id,
        l.listing_name,
        CASE
          WHEN m.sender_id = ? THEN m.reciever_id
          ELSE m.sender_id
        END as other_user_id,
        MAX(m.sent_at) as last_message_time
      FROM
        messages m
      JOIN
        listings l ON m.listing_id = l.listing_id
      WHERE
        m.sender_id = ? OR m.reciever_id = ?
      GROUP BY
        m.listing_id, other_user_id
      ORDER BY
        last_message_time DESC
    `, [userId, userId, userId]);
    
    const chats = [];
    
    for (const conv of conversations) {
      // Get other user's name
      const [users] = await pool.query(`
        SELECT firstName, lastName FROM users WHERE user_id = ?
      `, [conv.other_user_id]);
      
      // Get messages
      const [messages] = await pool.query(`
        SELECT sender_id, message_text, sent_at
        FROM messages
        WHERE 
          listing_id = ? AND
          ((sender_id = ? AND reciever_id = ?) OR
           (sender_id = ? AND reciever_id = ?))
        ORDER BY sent_at ASC
      `, [
        conv.listing_id,
        userId, conv.other_user_id,
        conv.other_user_id, userId
      ]);
      
      chats.push({
        listingId: conv.listing_id,
        listingName: conv.listing_name,
        withUserId: conv.other_user_id,
        withUser: users.length > 0 ? `${users[0].firstName} ${users[0].lastName}` : 'Unknown',
        lastMessageTime: conv.last_message_time,
        messages: messages.map(msg => ({
          text: msg.message_text,
          fromMe: msg.sender_id === userId,
          time: msg.sent_at
        }))
      });
    }
    
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, message: 'Error fetching chats' });
  }
});

router.get('/api/listing/:listingId', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  try {
    const [listings] = await pool.query(`
      SELECT l.*, u.firstName, u.lastName, u.user_id as seller_id
      FROM listings l
      JOIN users u ON l.seller_id = u.user_id
      WHERE l.listing_id = ?
    `, [req.params.listingId]);
    
    if (listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    res.json({ success: true, listing: listings[0] });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, message: 'Error fetching listing' });
  }
});

module.exports = router;