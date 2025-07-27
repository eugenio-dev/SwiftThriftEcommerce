const { pool } = require('./connection');

/*
  Only an example method on how a query works from the database.
  Doesn't apply to our schema or will work.
  
*/
const getPersonById = async (personId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Persons WHERE PersonID = ?', 
      [personId]
    );
    console.log(rows);

  } catch (error) {
    console.error('Error getting person:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getPersonById
};

