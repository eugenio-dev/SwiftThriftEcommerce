
const GET_CATEGORIES = `
SELECT category_id AS 'id', category_name AS 'name'
FROM categories
ORDER BY name DESC
`;

const GET_LISTINGS_BEGIN = `
SELECT l.listing_id, l.listing_name, l.listing_description, l.price, l.listing_status, l.created_at,
  u.firstName AS seller_firstName, u.lastName AS seller_lastName,
  p.thumbnailName AS primary_image
FROM listings l
INNER JOIN users u ON l.seller_id = u.user_id
LEFT JOIN pictures p ON l.listing_id = p.listing_id AND display_order = 0
WHERE l.listing_status = 'active'
`;

const SEARCH_CLAUSE = `
(l.listing_name LIKE ? OR l.listing_description LIKE ?)
`;

const CATEGORY_CLAUSE = `
l.category_id = ?
`;

const GET_LISTING_END = `
ORDER BY l.created_at DESC
`;

const GET_ALL_LISTINGS = GET_LISTINGS_BEGIN + GET_LISTING_END;

const GET_CATEGORY_NAME = `
SELECT category_name AS 'name'
FROM categories
WHERE category_id = ?
`

const GET_TOP_3_LISTINGS = GET_LISTINGS_BEGIN + `
ORDER BY l.price DESC
LIMIT 3
`

module.exports = {
       GET_CATEGORIES,
       GET_LISTINGS_BEGIN,
       CATEGORY_CLAUSE,
       SEARCH_CLAUSE,
       GET_LISTING_END,
       GET_ALL_LISTINGS,
       GET_CATEGORY_NAME,
       GET_TOP_3_LISTINGS
};