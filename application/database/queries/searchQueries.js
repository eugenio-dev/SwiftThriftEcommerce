const { pool } = require('../connection');

const {
    GET_CATEGORIES,
    GET_LISTINGS_BEGIN,
    CATEGORY_CLAUSE,
    SEARCH_CLAUSE,
    GET_LISTING_END,
    GET_ALL_LISTINGS,
    GET_CATEGORY_NAME,
    GET_TOP_3_LISTINGS
} = require('../sql/searchSQL');

// Get all categories for dropdown
const getCategories = async () => {
    try {
        const [rows] = await pool.query(GET_CATEGORIES);

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error getting categories:', error);
        return {
            success: false,
            error: error.message
        };
    }
};




// Search listings by category and/or text query
const searchListings = async (category, query) => {
    try {
        // Base query
        let sql = GET_LISTINGS_BEGIN;
    
        // Additional queries with category and/or search
        const conditions = [];
        const params = [];
        
            // Add category filter if provided
        if (category && category !== '') {
            conditions.push(CATEGORY_CLAUSE);
            params.push(category);
        }
        
            // Add text search if provided
        if (query && query !== '') {
            conditions.push(SEARCH_CLAUSE);
            const searchTerm = `%${query}%`;
            params.push(searchTerm, searchTerm);
        }
        
        // Add clauses for category and/or search
        if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
        }
        
        // Put ending of SQL query
        sql += GET_LISTING_END;
        
        const [rows] = await pool.query(sql, params);
        
        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error finding SPECIFIC listings:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

  const getAllListings = async () => {
    try {
        const [rows] = await pool.query(GET_ALL_LISTINGS);

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error finding ALL listings:', error);
        return {
            success: false,
            error: error.message
        };
    }
  };

// Get name of category based on category_id
const getCategoryName = async (category_id) => {
    try {
        const [rows] = await pool.query(GET_CATEGORY_NAME, category_id);
        var category_name;

        if (rows.length == 1) {
            category_name = rows[0].name;
        } else {
            category_name = "NULL";
        }

        //console.log(category_name);
        return category_name;

    } catch (error) {
        console.error('Error finding category name:', error);
        return {
            success: false,
            error: error.message
        };
    }
  };


// Get the top 3 listings (for Featured Listings)
const getTop3 = async () => {
    try {
        const [rows] = await pool.query(GET_TOP_3_LISTINGS);
        
        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error finding TOP 3 listings:', error);
        return {
            success: false,
            error: error.message
        };
    }
  };

  async function getListingById(id) {
  const [rows] = await pool.query('SELECT * FROM listings WHERE listing_id = ?', [id]);
  return rows[0];
}

 // gets serive + seller info
const SERVICE_CATEGORY_ID = 3;
async function getServiceById(serviceId) {
  const [rows] = await pool.query(`
    SELECT l.*, u.firstName AS seller_name
    FROM listings l
    JOIN users u ON l.seller_id = u.user_id
    WHERE l.listing_id = ? AND l.category_id = ?
  `, [serviceId, SERVICE_CATEGORY_ID]);


  return rows[0]; // return a single listing object
}

module.exports = {
    getCategories,
    searchListings,
    getAllListings,
    getCategoryName,
    getTop3,
    getListingById,
    getServiceById
};