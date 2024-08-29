const Gallery = require('../Models/Gallery');

async function getContent(req, res) {
    try {
        const { directoryName, type } = req.query; // Use req.query for GET request params

        if (!directoryName) {
            return res.status(400).json({ success: false, message: 'directoryName is required' });
        }

        if (!type || (type !== 'images' && type !== 'videos')) {
            return res.status(400).json({ success: false, message: 'Invalid or missing type. Expected "images" or "videos"' });
        }

        const content = await Gallery.findOne({ name: directoryName }).exec();

        if (content) {
            const finalContent = content[type]; // Access the correct field based on the type

            if (finalContent) {
                return res.status(200).json({ success: true, finalContent });
            } else {
                return res.status(404).json({ success: false, message: 'Content not found' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'Gallery not found' });
        }
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function uploadContent(req, res) {
    try {
        const { directoryName, type, url } = req.body;
        const content = await Gallery.findOne({ name: directoryName }).exec();

        if (!content) {
            return res.status(404).json({ success: false, message: 'Gallery not found' });
        }

        const typeField = type;
        if (!['images', 'videos'].includes(typeField)) {
            return res.status(400).json({ success: false, message: 'Invalid type' });
        }

        content[typeField].push(url);
        await content.save();

        const finalContent = content[typeField];
        return res.status(200).json({ success: true, message: 'Content uploaded successfully', finalContent });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function deleteContent(req, res) {
    try {
        const { directoryName, type, content } = req.body;

        // Find the gallery entry by directory name
        const gallery = await Gallery.findOne({ name: directoryName }).exec();

        if (!gallery) {
            return res.status(404).json({ success: false, message: 'Directory not found' });
        }

        // Filter out the content to be deleted from the appropriate array (images or videos)
        gallery[type] = gallery[type].filter((item) => item !== content);

        // Save the updated gallery
        await gallery.save();

        return res.status(200).json({ success: true, message: 'Content deleted successfully', newContent: gallery[type] });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    getContent,
    uploadContent,
    deleteContent
};
