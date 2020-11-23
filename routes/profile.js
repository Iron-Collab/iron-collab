const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { uploader, cloudinary } = require('../config/cloudinary');

const ensureLogin = require('connect-ensure-login');

router.get('/', ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.user;
  res.render('profile/profile', { user });
});

router.get('/:id/edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.findById(req.params.id).populate('user.course')
  .then((user) => {
    console.log('user', user)
    
    let optionsCourse = '';
    ['Web Development', 'UX/UI Design', 'Data Analytics', 'Cybersecurity'].forEach((course) => {
      let selectedCourse = '';
      selectedCourse = (user.course === course) ? ' selected' : '';
      optionsCourse += `<option value='${course}' ${selectedCourse}>${course}</option>`
    })

    let optionsLocation = '';
    ['Amsterdam', 'Barcelona', 'Berlin', 'Lisbon', 'Madrid', 'Mexico City', 'Miami', 'Paris', 'São Paulo', 'Remote'].forEach((location) => {
      let selectedLocation = '';
      selectedLocation = (user.location === location) ? ' selected' : '';
      optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`
    })
    console.log('options', optionsCourse);

    res.render('profile/profileEdit', { user, optionsCourse, optionsLocation });
    })
    .catch(err => next(err))
});

module.exports = router;