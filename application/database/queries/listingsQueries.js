const { pool } = require('../connection');

const {
    ADD_LISTING,
    DELETE_LISTING,
    CHANGE_LISTING_INFO,
    CHANGE_LISTING_STATUS,
    GET_LISTINGS_OF_USER,
    GET_LISTING_BY_ID
} = require('../sql/listingsSQL');



const addListing = async (seller, category, name, desc, price) => {
    try {
        const [rows] = await pool.query(ADD_LISTING,
            [seller, category, name, desc, price] // Use array for parameters
        );

        console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error adding listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const deleteListing= async (seller, listing) => {
    try {
        const [rows] = await pool.query(DELETE_LISTING,
            [seller, listing]
        );

        console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error deleting listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const changeListingInfo = async (listing, category, name, desc, price) => {
    try {
        const [rows] = await pool.query(CHANGE_LISTING_INFO,
            [name, desc, category, price, listing]
        );

        console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error changing listing info:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const changeListingStatus = async (listing, status) => {
    try {
        const [rows] = await pool.query(CHANGE_LISTING_STATUS,
            [status, listing]
        );

        console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error changing listing status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getListingsByUser = async (user) => {
    try {
        const [rows] = await pool.query(GET_LISTINGS_OF_USER,
           user
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error changing listing status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getListing = async (listing) => {
    try {
        const [rows] = await pool.query(GET_LISTING_BY_ID,
           listing
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error changing listing status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};



  async function getServiceById(serviceId) {
  const [rows] = await pool.query(`
    SELECT s.*, u.firstName AS seller_name
    FROM services s
    JOIN users u ON s.seller_id = u.user_id
    WHERE s.service_id = ?
  `, [serviceId]);

  return rows[0]; // return one service
}
  

module.exports = {
    addListing,
    deleteListing,
    changeListingInfo,
    changeListingStatus,
    getListingsByUser,
    getListing
};