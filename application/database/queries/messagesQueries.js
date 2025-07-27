const { pool } = require("../connection");

const {
    GET_MESSAGES,
    CREATE_MESSAGE,
    CLEAR_MESSAGES_BY_LISTING
} = require('../sql/messagesSQL');

const getConvo = async (user_id, listing_id) => {
    try {
        const [rows] = await pool.query(GET_MESSAGES,
            [user_id, user_id, listing_id]
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error getting conversation info:', error);
        return {
            success: false,
            error: error.message
        };
    }
};


const sendMessage = async (listing_id, sender_id, reciever_id, message_text) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (listing_id, sender_id, reciever_id, message_text) VALUES (?, ?, ?, ?)',
      [listing_id, sender_id, reciever_id, message_text]
    );
    
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

module.exports = {
  sendMessage
};

const deleteMessagesByListing = async (listing) => {
    try {
        const [rows] = await pool.query(CLEAR_MESSAGES_BY_LISTING,
           listing
        );

        //console.log(rows);
        return rows;

    } catch (error) {
        console.error('Error creating message info:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    getConvo,
    sendMessage,
    deleteMessagesByListing
};