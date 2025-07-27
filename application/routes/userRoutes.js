// Create a new file: routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../database/connection');

// Get all users except the current user
router.get('/api/users', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const userId = req.session.user.id;
    
    // Get all users except the current user
    const [users] = await pool.query(`
      SELECT user_id, firstName, lastName
      FROM users 
      WHERE user_id != ?
    `, [userId]);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

router.get('/api/current-user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
  
  res.json({ 
    success: true, 
    user: {
      id: req.session.user.id,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName
    }
  });
});

router.get('/api/user/:userId', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, firstName, lastName FROM users WHERE user_id = ?',
      [req.params.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

module.exports = router;