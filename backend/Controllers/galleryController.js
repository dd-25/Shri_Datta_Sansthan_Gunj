const Gallery = require('../Models/Gallery');

async function getAllDirectories(req, res) { // Added req and res as parameters
    try {
        const directories = await Gallery.find().exec();
        return res.status(200).json({ success: true, directories });
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' }); // Added status and message
    }
}

async function createDirectory(req, res) {
    try {
        const directory = new Gallery(req.body);
        await directory.save();
        return res.status(201).json({ success: true, directory });
    }
    catch (error) {
        console.log('error: ', error);
        return res.status(500).json({ success: false, message: error });
    }
}

async function renameDirectory(req, res) {
    try {
        const directory = await Gallery.findOne({name: req.body.old_name});
        directory.name = req.body.new_name;
        await directory.save();
        return res.status(200).json({ success: true, directory });
    }
    catch(error) {
        console.log('error: ', error);
        return res.status(500).json({success:false, message: error });
    }
}

async function deleteDirectory(req, res) {
    try {
        const directory = await Gallery.deleteOne(req.body);
        return res.status(200).json({ success: true, directory });
    }
    catch(error) {
        console.log('error: ', error);
        return res.status(500).json({success:false, message: error });
    }
}

async function getContent(req, res) {
    try {
        const directoryName = req.params.directoryName;
        const content = await Gallery.find({directoryName}).exec();
        return res.status(200).json({ success: true, finalContent: content });
    }
    catch(err) {
        console.log('error: ', err);
        return res.status(500).json({success: false, message: err});
    }
}

module.exports = {
    getAllDirectories,
    createDirectory,
    renameDirectory,
    deleteDirectory,
    getContent
};
