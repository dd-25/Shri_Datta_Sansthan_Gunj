const Bhakt = require('../Models/Bhakt');
const { setBhakt } = require('../Services/auth');

// Async function to validate and log in a Bhakt
async function validateLogin(req, res) {
    try {
        const { username, password } = req.body;

        // Find the bhakt by username
        const bhakt = await Bhakt.findOne({ username, password, active: true });
        if (!bhakt) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Update the last visit date
        bhakt.last_visit = new Date();
        await bhakt.save();

        // Generate token and set cookie
        const token = setBhakt(bhakt);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 720);
        res.cookie('uid', token, {
            httpOnly: false,
            secure: false, // Set to true in production
            sameSite: 'strict',
            expires: expiryDate
        });

        return res.status(200).json({ success: true, message: 'You are logged in successfully' });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
}

module.exports = {
    validateLogin,
};
