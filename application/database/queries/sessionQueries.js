const { pool } = require('../connection');

const {
    PUT_USERID,
    FORCE_DELETE_SESSIONS,
    FIND_SESSIONS
} = require('../sql/sessionSQL');


const setSessionsUserId = async (user, session) => {
    try {
        const [rows] = await pool.query(PUT_USERID,
            [user,session]
        );
        
        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error setting user_id for a session:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Used to check if an account is already logged in
const findActiveUser = async (user) => {
    try {
        const [rows] = await pool.query(FIND_SESSIONS,
            user
        );
        
        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error force deleting sessions of a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
};



// Will be useful for in case a user has multiple sessions; Possible use for admin purposes
const forceDeleteSessionsByUser = async (user) => {
    try {
        const [rows] = await pool.query(FORCE_DELETE_SESSIONS,
            user
        );
        
        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error force deleting sessions of a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    setSessionsUserId,
    forceDeleteSessionsByUser,
    findActiveUser
};