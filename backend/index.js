require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect('mongodb://localhost/bhaktDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
const verifyRoutes = require('./Routes/verifyToken');
app.use('/api/verifyToken', verifyRoutes);

const signupRoutes = require('./Routes/signup');
app.use('/api/signup', signupRoutes);

const loginRoutes = require('./Routes/login');
app.use('/api/login', loginRoutes);

const searchBhaktRoutes = require('./Routes/searchBhakt');
app.use('/api/searchBhakt', searchBhaktRoutes);

const galleryRoutes = require('./Routes/gallery');
app.use('/api/gallery', galleryRoutes);

const contentRoutes = require('./Routes/content');
app.use('/api/content', contentRoutes);

const audioRoutes = require('./Routes/audio');
app.use('/api/audio', audioRoutes);

const notificationRoutes = require('./Routes/notifications');
app.use('/api/notifications', notificationRoutes);

const donateRoutes = require('./Routes/donate');
app.use('/api/donate', donateRoutes);

const imagesliderRoutes = require('./Routes/imageslider');
app.use('/api/imageslider', imagesliderRoutes);

const profileRoutes = require('./Routes/profile');
app.use('/api/profile', profileRoutes);

const pujaslotRoutes = require('./Routes/pujaslot');
app.use('/api/pujaslot', pujaslotRoutes);

const niwasRoutes = require('./Routes/niwas');
app.use('/api/niwas', niwasRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});