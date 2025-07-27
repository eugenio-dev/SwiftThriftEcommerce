const { pool } = require('../connection');

const { 
    SAVE_PICTURE, 
    DELETE_PICTURES,
    GET_PICTURES,
    GET_PICTURE  
} = require("../sql/picturesSQL");


const savePicture = async (listing, origName, thumbName, order) => {
    try {
        const [rows] = await pool.query(SAVE_PICTURE,
            [listing, origName, thumbName, order]
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error saving picture:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const deletePictures = async (listing) => {
    try {
        const [rows] = await pool.query(DELETE_PICTURES,
            listing
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error saving picture:', error);
        return {
            success: false,
            error: error.message
        };
    }
};


const getAPicture = async (listing, order) => {
    try {
        const [rows] = await pool.query(GET_PICTURE,
            [listing,order]
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error fetching picture from listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getPictures = async (listing) => {
    try {
        const [rows] = await pool.query(GET_PICTURES,
            listing
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error fetching collection of pictures from listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
};


module.exports = {
    savePicture,
    deletePictures,
    getAPicture,
    getPictures
};