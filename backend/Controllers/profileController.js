const Bhakt = require('../Models/Bhakt'); // Assuming a Mongoose model for the user

// Update profile
async function editProfile(req, res) {
    try {
        const { username, name, phone, dob, gender, address, aadhar, occupation, email } = req.body;
        
        const bhakt = await Bhakt.findOne({ username: username});

        if (!bhakt) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        bhakt.name = name;
        bhakt.phone = phone;
        bhakt.dob = dob;
        bhakt.gender = gender;
        bhakt.address.street = address.street;
        bhakt.address.city = address.city;
        bhakt.address.state = address.state;
        bhakt.address.country = address.country;
        bhakt.address.pincode = address.pincode;
        bhakt.aadhar = aadhar;
        bhakt.occupation = occupation;
        bhakt.email = email;

        await bhakt.save();
        return res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// Check password
async function checkPassword(req, res) {
    const { username, currentPassword } = req.body;
    const bhakt = await Bhakt.findOne({ username: username });
    if (!bhakt) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = (bhakt.password==currentPassword);
    if (isMatch) {
        return res.json({ success: true });
    } else {
        return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
};

// Change password
async function changePassword(req, res) {
    try {
        const { username, newPassword } = req.body;
        const bhakt = await Bhakt.findOne({ username: username });

        if (!bhakt) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        bhakt.password = newPassword;

        await bhakt.save();
        return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

module.exports = {
    editProfile,
    checkPassword,
    changePassword
};