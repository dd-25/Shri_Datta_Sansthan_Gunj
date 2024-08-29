const Audio = require('../Models/Audio');

async function getAudio(req, res) {
    try {
        const audios = await Audio.find({});
        res.json({ success: true, finalContent: audios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve audio files' });
    }
}

async function uploadAudio(req, res) {
    const { url, name } = req.body;
    try {
        const newAudio = new Audio({ name, url });
        await newAudio.save();
        const audios = await Audio.find({});
        res.json({ success: true, finalContent: audios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to upload audio' });
    }
}

async function deleteAudio(req, res) {
    const { content } = req.body;
    try {
        await Audio.findOneAndDelete({ url: content.url });
        const audios = await Audio.find({});
        res.json({ success: true, newContent: audios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete audio' });
    }
}

async function renameAudio(req, res) {
    const { oldName, newName } = req.body;
    try {
        const audio = await Audio.findOneAndUpdate(
            { name: oldName },
            { name: newName },
            { new: true }
        );
        const audios = await Audio.find({});
        res.json({ success: true, newContent: audios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to rename audio' });
    }
}

module.exports = {
    getAudio,
    uploadAudio,
    deleteAudio,
    renameAudio
};
