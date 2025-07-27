const SAVE_PICTURE = `
INSERT INTO pictures 
(listing_id, originalName, thumbnailName, display_order) 
VALUES (?, ?, ?, ?)
`

const DELETE_PICTURES = `
DELETE FROM pictures
WHERE listing_id = ?
`

const GET_PICTURES = `
SELECT * FROM pictures
WHERE listing_id = ? 
ORDER BY display_order DESC
`

const GET_PICTURE = `
SELECT * FROM pictures
WHERE listing_id = ? AND display_order = ?;
`

module.exports = {
    SAVE_PICTURE,
    DELETE_PICTURES,
    GET_PICTURES,
    GET_PICTURE
};