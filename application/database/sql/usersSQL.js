const ADD_USER = `
INSERT INTO users (firstName, lastName, email, user_password) 
VALUES (?, ?, ?, ?)
`

const GET_USER = `
SELECT * FROM users
WHERE email = ?
`

const DELETE_USER = `
DELETE FROM users 
WHERE email = ? AND user_id = ?
`

const CHANGE_USER_PERMS = `
UPDATE users 
SET perms = ? 
WHERE email = ?
`

const CHANGE_USER_ROLE = `
UPDATE users 
SET user_role = ? 
WHERE email = ?
`

const CHANGE_PFP = `
UPDATE users 
SET profile_picture = ? 
WHERE user_id = ?
`

module.exports = {
    ADD_USER,
    GET_USER,
    DELETE_USER,
    CHANGE_USER_PERMS,
    CHANGE_USER_ROLE,
    CHANGE_PFP
}







