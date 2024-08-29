require('dotenv').config();

const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

function verifyToken(req, res) {
    const {token} = req.body;
    // console.log(token);
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, secret);
        // console.log(decoded);
        // Check if token is valid and not expired
        if (decoded) {
            res.status(200).json({ success: true, data: decoded });
        } else {
            res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid catch token' });
    }
}

module.exports = {
    verifyToken
}