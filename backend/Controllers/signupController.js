require('dotenv').config();

const Bhakt = require('../Models/Bhakt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Async function to create a new Bhakt
async function createBhakt(req, res) {
  try {
    let formData = req.body;
    const phone = [formData.phone.toString()];
    const email = [formData.email.toString()];
    // Generate username and password
    const username = "DG-" + phone;
    const password = uuidv4().replace(/-/g, '').slice(0, 10);
    const bhaktSince = Date.now();
    const last_visit = bhaktSince;
    formData = { ...formData, username, password, bhaktSince, last_visit, phone, email };

    // Create and save the new Bhakt
    const newBhakt = new Bhakt(formData);
    await newBhakt.save();

    // Send email with username and password
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER, // replace with admin's email
        pass: process.env.EMAIL_PASS // replace with admin's email password
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // replace with admin's email
      to: newBhakt.email[0],
      subject: 'Your Bhakt Registration Details',
      text: `Dear ${newBhakt.name},\n\nYour registration is successful. Here are your login details:\nUsername: ${newBhakt.username}\nPassword: ${newBhakt.password}\n\nPlease keep this information safe.\n\nRegards,\nTemple Admin`
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ Object: newBhakt, success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'An error occurred while creating the Bhakt.' });
  }
}

module.exports = {
  createBhakt
};
