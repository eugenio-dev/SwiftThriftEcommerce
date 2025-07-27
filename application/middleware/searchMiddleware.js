// Make sure that the search query is an input of up to 40 alphanumeric characters
const validSearch = (req,res,next) => {

    const { query } = req.query;
    const alphaNumberRegex = /^[a-zA-Z0-9 ]*$/;
    

    // Check if all the characters in the input are alphanumeric
    if (!alphaNumberRegex.test(query)) {
        return res.status(400).json({ error: 'Search query is not alphanumeric' });
    }

    // Check if the query is longer than 40 characters
    if (query.length > 40) {
        return res.status(400).json({ error: 'Search query is too long' });
    }

    next();
}

// Remove any leading and trailing spaces in the search (Edge case for just all spaces)
const trimSearch = (req,res,next) => {

    req.query.query = req.query.query.trim();

    next();
}

module.exports = {
    validSearch,
    trimSearch
};