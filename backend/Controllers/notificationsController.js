const Notifications = require('../Models/Notifications');

async function getAllNotifications(req, res) {
    try {
        // Attempt to find a notification document by the provided name
        const recentList = await Notifications.findOne({name: 'recent'}).exec();
        const upcomingList = await Notifications.findOne({name: 'upcoming'}).exec();
        const dailyList = await Notifications.findOne({name: 'daily'}).exec();
        return res.status(200).json({ success: true, list: {recent: recentList.list || [], upcoming: upcomingList.list || [], daily: dailyList.list || []} });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'An error occurred in fetching notifications' });
    }
}

async function getNotifications(req, res) {
    try {
        // Attempt to find a notification document by the provided name
        const notifications = await Notifications.findOne({ name: req.query.name }).exec();
        return res.status(200).json({ success: true, list: (notifications.list || []) });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'An error occurred in fetching notifications' });
    }
}

async function postNotifications(req, res) {
    try {
        let notification = await Notifications.findOne({ name: req.body.name });

        // If no notification list is found, create a new document with the provided name and notification
        if (!notification) {
            notification = new Notifications({
                name: req.body.name,
                list: [req.body.notification]
            });
        }
        else {
            // Check if the notification already exists in the list
            if (notification.list.includes(req.body.notification)) {
                return res.status(201).json({ success: true, message: 'Notification created successfully' });
            }
            notification.list.push(req.body.notification);
        }
        await notification.save();
        return res.status(201).json({ success: true, message: 'Notification created successfully' });
    } catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({ success: false, message: 'An error occurred in creating notifications' });
    }
}

async function deleteNotifications(req, res) {
    console.log(req.query.name);
    try {
        const notification = await Notifications.findOne({ name: req.query.name });
        notification.list = notification.list.filter((item) => item !== req.query.notification);
        await notification.save();
        return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ success: false, message: 'An error occurred in deleting notification' });
    }
}

async function editNotifications(req, res) {
    try {
        const notification = await Notifications.findOne({ name: req.body.name });
        if (!notification || !notification.list) {
            return res.status(404).json({ success: false, message: 'Notification list not found' });
        }
        // Update the notification in the list
        notification.list = notification.list.map((item) =>
            item === req.body.notification ? req.body.newNotification : item
        );
        await notification.save();
        return res.status(200).json({ success: true, message: 'Notification edited successfully' });
    } catch (error) {
        console.error('Error editing notification:', error);
        return res.status(500).json({ success: false, message: 'An error occurred in editing notification' });
    }
}

module.exports = {
    getAllNotifications,
    getNotifications,
    postNotifications,
    deleteNotifications,
    editNotifications
};
