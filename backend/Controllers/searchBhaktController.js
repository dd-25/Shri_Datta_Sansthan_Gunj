const Bhakt = require('../Models/Bhakt');

async function showBhakts(req, res) {
    try {
        let filters = req.body;
        filters = {...filters, active:true};

        // Optional: Validation/Sanitization of filters
        // You can add validation/sanitization logic here if necessary
        // include pagination and indexing

        console.log(filters);
        const results = await Bhakt.find(filters).exec();
        console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error during search:', error); // Log the error for debugging
        res.status(500).json({ error: 'An error occurred while searching for bhakts.' });
    }
}

module.exports = {
    showBhakts
};

// handle that to send only required data to frontend and not data like password and username, etc.