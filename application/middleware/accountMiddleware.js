const { getUser } = require('../database/queries/usersQueries');
const { findActiveUser } = require('../database/queries/sessionQueries');

// Validate input for sign up form (Names, email, password, confirm password, and terms checkbox)
const validateSignup = (req,res,next) => {

    const {firstName, lastName, email, password, confirmpassword, termsAcceptance } = req.body;

    if (!firstName || firstName.length < 2) {
        return res.json({ success: false, message: 'First name must be 2 characters long. Apologises if it is one somehow.' });
    }

    if (!lastName || lastName.length < 2) {
        return res.json({ success: false, message: 'Last name must be 2 characters long. Apologises if it is one somehow.' });
    }

    const emailRegex = /^[\w-\.]+@sfsu\.edu$/;
    if (!email || !emailRegex.test(email)) {
        return res.json({ success: false, message: 'Please provide a valid email.' });
    }

    if (!password || password.length < 6) {
        return res.json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (password != confirmpassword) {
        return res.json({ success: false, message: 'Password confirmation does not match password' });
    }

    if (!termsAcceptance) {
        return res.json({ success: false, message: 'Terms not accepted' });
    }

    next();

}

// Prevent signup if account already exists
const signupCheck = async (req,res,next) => {

    const { email, password } = req.body;

    const check = await getUser(email);

    if (check.length > 0) {
        return res.json({ success: false, message: 'User already exists' });
    }

    if (!password || password.length < 6) {
        return res.json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    next();

}

// Validate input for login form (Email and password)
const validateLogin = (req,res,next) => {

    const { email, password } = req.body;

    const emailRegex = /^[\w-\.]+@sfsu\.edu$/;

    if (!email || !emailRegex.test(email)) {
        return res.json({ success: false, message: 'Please provide a valid email.' });
    }

    if (!password || password.length < 6) {
        return res.json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    next();

}

// Prevent login if account does not exist
const loginCheck = async (req,res,next) => {

    const { email } = req.body;

    const check = await getUser(email);
    // console.log(check);

    if (check.length <= 0) {
        return res.json({ success: false, message: 'User does not exist' });
    }

    next();
}


// Check if the user is logging into an account that is still logged in or is currently logged in
const loginOverlap = async (req,res,next) => {

    const { email } = req.body;
    const currentSess = req.session.user;

    // Check if the user is currently logged into a different account
    if (currentSess) {
        return res.json({ success: false, message: 'You are already logged in to: ' + currentSess.email });
    }

    // Check if the account the user is trying to log in to is in use elsewhere
    const [user] = await getUser(email);
    const check = await findActiveUser(user.user_id);
    
    if (check.length > 0) {
        return res.json({ success: false, message: 'User is currently logged in elsewhere' });
    }

    next();
}

module.exports = {
    validateSignup,
    signupCheck,
    validateLogin,
    loginCheck,
    loginOverlap
};

