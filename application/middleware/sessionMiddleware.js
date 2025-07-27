const { findActiveUser, setSessionsUserId } = require("../database/queries/sessionQueries");


// Logging the session.user object inside the upload route for profile picture
const debugUpload = (req, res, next) => {
    console.log("🧠 DEBUG upload route: session.user =", req.session.user);
    next();
};

// Make session user available in all EJS templates
const userDataInLocal = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

// Regenerate sessions that have existed for more than 15 minutes
const regenCheck = async (req, res, next) => {

    // Don't run if not logged in
    if (!req.session.user || !req.session.user.id) {
        return next();
    } 

    const [row] = await findActiveUser(req.session.user.id);

    // Another "Don't run if not logged in"
    if (!row || !row.created_at || !row.user_id) {
        return next();
    }

    const lastTime = new Date(row.created_at);
    const nowTime = new Date();
    const maxTime = 1000 * 60 * 15 // 1000ms * 60s * 15m

    if (nowTime - lastTime >= maxTime) {
        const preservedData = req.session.user;
        const user_id = row.user_id;

        await new Promise ((resolve,reject) =>
            req.session.regenerate(err => {
                if (err) return reject(err);
            
                req.session.user = preservedData;
            
                req.session.save(async (err) => {
                    if (err) return reject(err);
                
                    const done = await setSessionsUserId(user_id, req.sessionID);
                    if (!done.affectedRows) {
                        return reject(err);
                    }
                    console.log("Session has been regenerated after 15 minutes");
                    resolve();
                })
        }));
    }

    next();
  };

module.exports = {
    debugUpload,
    userDataInLocal,
    regenCheck
}