const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 11;

const {
  validateSignup,
  signupCheck,
  validateLogin,
  loginCheck,
  loginOverlap
} = require('../middleware/accountMiddleware');

const { getUser, addUser } = require('../database/queries/usersQueries');
const { setSessionsUserId } = require('../database/queries/sessionQueries');


// --------- LOGIN ---------
router.post('/login', validateLogin, loginCheck, loginOverlap, async (req, res) => {
  const { email, password } = req.body;
  const [userFromDB] = await getUser(email);

  const isMatch = await bcrypt.compare(password, userFromDB.user_password);
  if (!isMatch) {
    return res.json({ success: false, message: 'Invalid email or password' });
  }

  req.session.regenerate(err => {
    if (err) return res.json({ success: false, message: 'Session did not regenerate' });

    req.session.user = {
      id: userFromDB.user_id,
      email: userFromDB.email,
      firstName: userFromDB.firstName,
      lastName: userFromDB.lastName,
      role: userFromDB.user_role,
      perms: userFromDB.perms,
      profile_picture: userFromDB.profile_picture
    };

    req.session.save(async (err) => {
      if (err) return res.json({ success: false, message: 'Session did not save' });

      const done = await setSessionsUserId(userFromDB.user_id, req.sessionID);
      if (!done.affectedRows) {
        return res.json({ success: false, message: 'Session user_id has not been set right' });
      }

      return res.json({ success: true, message: 'User has been logged in' });
    });
  });
});


// --------- SIGNUP ---------
router.post('/signup', validateSignup, signupCheck, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const row = await addUser(firstName, lastName, email, hashedPassword);
  if (!row.affectedRows) {
    return res.json({ success: false, message: 'New user was not inserted into database' });
  }

  const [userFromDB] = await getUser(email);

  req.session.regenerate(err => {
    if (err) return res.json({ success: false, message: 'Session did not regenerate' });

    req.session.user = {
      id: userFromDB.user_id,
      email: userFromDB.email,
      firstName: userFromDB.firstName,
      lastName: userFromDB.lastName,
      role: userFromDB.user_role,
      perms: userFromDB.perms,
      profile_picture: userFromDB.profile_picture
    };

    req.session.save(async (err) => {
      if (err) return res.json({ success: false, message: 'Session did not save' });

      const done = await setSessionsUserId(userFromDB.user_id, req.sessionID);
      if (!done.affectedRows) {
        return res.json({ success: false, message: 'Session user_id has not been set right' });
      }

      return res.json({ success: true, message: 'User has been logged in' });
    });
  });
});


// --------- LOGOUT ---------
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });

    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
});

module.exports = router;

// --------- SELL FROM HOMEPAGE ------
router.get('/sell', (req, res) => {
  if (!req.session.user) {
    // not logged in
    return res.redirect('login?redirect=/create-listing');
  }

  // user is logged in
  return res.redirect('/create-listing');
});

