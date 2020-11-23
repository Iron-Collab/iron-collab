const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { uploader, cloudinary } = require('../config/cloudinary');

const ensureLogin = require('connect-ensure-login');

router.get('/', (req, res) => {
  const user = req.user;
  res.render('profile/profile', { user });
});

router.get('/edit', (req, res) => {
  const user = req.user;
  
  res.render('profile/profileEdit', { user });
});

module.exports = router;