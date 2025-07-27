const { pool } = require('../connection');

const {
    ADD_USER,
    GET_USER,
    DELETE_USER,
    CHANGE_USER_PERMS,
    CHANGE_USER_ROLE,
    CHANGE_PFP
} = require('../sql/usersSQL');



const addUser = async (firstName, lastName, email, password) => {
    try {
        const [rows] = await pool.query(ADD_USER,
            [firstName, lastName, email, password]
        );
        
        // console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error adding a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getUser = async (email) => {
    try {
        const [rows] = await pool.query(GET_USER,
            email
        );

        // console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error getting a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

const deleteUser = async (email, userID) => {
    try {
        const [rows] = await pool.query(DELETE_USER,
            [email, userID]
        );

        // console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error deleting a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const changeUserPerms = async (email, perms) => {
    try {
        const [rows] = await pool.query(CHANGE_USER_PERMS,
            [perms, email]
        );

        // console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error deleting a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const changeUserRole = async (email, role) => {
    try {
        const [rows] = await pool.query(CHANGE_USER_ROLE,
            [role, email]
        );

        // console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error deleting a user:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Update the path field for the profile picture
const updateProfilePicPath = async (user, picture) => {
    try {
        const [rows] = await pool.query(CHANGE_PFP,
            [picture,user]
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error updating a user\'s profile picture:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    addUser,
    getUser,
    deleteUser,
    changeUserPerms,
    changeUserRole,
    updateProfilePicPath
};