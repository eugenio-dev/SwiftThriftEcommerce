const PUT_USERID = `
UPDATE sessions SET user_id = ?
WHERE session_id = ?
`

const FORCE_DELETE_SESSIONS = `
DELETE FROM sessions 
WHERE user_id = ?
`

const FIND_SESSIONS = `
SELECT * FROM sessions
WHERE user_id = ?
`

module.exports = {
    PUT_USERID,
    FORCE_DELETE_SESSIONS,
    FIND_SESSIONS
};