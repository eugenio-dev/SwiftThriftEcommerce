
const ADD_LISTING = `
INSERT INTO listings 
(seller_id, category_id, listing_name, listing_description, price) 
VALUES (?, ?, ?, ?, ?)
`;

const DELETE_LISTING = `
DELETE FROM listings
WHERE seller_id = ? AND listing_id = ?
`;

const CHANGE_LISTING_INFO = `
UPDATE listings
SET listing_name = ?, listing_description = ?, category_id = ?, price = ?
WHERE listing_id = ?
`;

const CHANGE_LISTING_STATUS = `
UPDATE listings
SET listing_status = ?
WHERE listing_id = ?
`;

const GET_LISTINGS_OF_USER = `
SELECT l.listing_id, l.listing_name, l.listing_description, l.price, l.listing_status, l.created_at,
 l.category_id, p.thumbnailName as primary_image
FROM listings l
LEFT JOIN pictures p ON l.listing_id = p.listing_id AND display_order = 0
WHERE seller_id = ?
ORDER BY created_at DESC
`

const GET_LISTING_BY_ID = `
SELECT listing_id, seller_id, category_id, listing_name, listing_description, 
       price, listing_status, created_at, updated_at
FROM listings
WHERE listing_id = ?
`

module.exports = {
    ADD_LISTING,
    DELETE_LISTING,
    CHANGE_LISTING_INFO,
    CHANGE_LISTING_STATUS,
    GET_LISTINGS_OF_USER,
    GET_LISTING_BY_ID 
};