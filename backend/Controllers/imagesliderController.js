const Imageslider = require('../Models/Imageslider');

// Function to get all content
async function getContent(req, res) {
    try {
        let images = await Imageslider.find({});
        if(images.length==0)
            images = [];
        return res.status(200).json({ success: true, images });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Function to upload new content
async function uploadContent(req, res) {
    try {
        const { url, description } = req.body;

        // Create a new image slider entry
        const content = new Imageslider({
            image: url,
            description: description
        });

        // Save the content
        await content.save();

        return res.status(200).json({ success: true, message: 'Content uploaded successfully' });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Function to delete content by URL
async function deleteContent(req, res) {
    try {
        const { url } = req.body;

        // Find and delete the image by URL
        const result = await Imageslider.findOneAndDelete({ image: url });

        return res.status(200).json({ success: true, message: 'Content deleted successfully' });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function editContent(req, res) {
    try {
        const { url, description } = req.body;
        const image = await Imageslider.findOne({image:url}).exec();
        image.description = description;
        await image.save();
        return res.status(200).json({ success: true, message: 'description updated successfully' });
    }
    catch(error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "server Error" });
    }
}

module.exports = {
    getContent,
    uploadContent,
    deleteContent,
    editContent
};