require('dotenv').config();

const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

function setBhakt(bhakt) {
    // Create a copy of the bhakt object excluding the password
    const { password, ...cookieData } = bhakt._doc ? bhakt._doc : bhakt; // Adjust for Mongoose documents
    return jwt.sign({ ...cookieData }, secret);
}

function getBhakt(token) {
    if (!token)
        return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}

module.exports = {
    getBhakt,
    setBhakt
};
