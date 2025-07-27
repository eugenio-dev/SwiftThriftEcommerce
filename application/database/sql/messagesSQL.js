const GET_MESSAGES = `
SELECT sender_id, reciever_id, message_text, sent_at
FROM messages
WHERE (sender_id = ? OR reciever_id = ?) AND listing_id = ?
ORDER BY sent_at DESC
`

const CREATE_MESSAGE = `
INSERT INTO messages (listing_id, sender_id, reciever_id, message_text)
VALUES (?, ?, ?, ?)
`

const CLEAR_MESSAGES_BY_LISTING = `
DELETE FROM messages
WHERE listing_id = ?
`

module.exports = {
    GET_MESSAGES,
    CREATE_MESSAGE,
    CLEAR_MESSAGES_BY_LISTING
};