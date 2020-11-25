const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const { uploader, cloudinary } = require('../config/cloudinary');
const ensureLogin = require('connect-ensure-login');

// display profile
router.get('/:id', ensureLogin.ensureLoggedIn(), async (req, res) => {
  const user = await User.findById(req.params.id);
  const project = await Project.find({ owner: [req.params.id] });
  const applied = await Project.find({ applicants: [req.params.id] });
  const team = await Project.find({ team: [req.params.id] });
  res.render('profile/profile', { user, project, applied, team })
});

// display edit profile
router.get('/:id/edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.findById(req.params.id).populate('user.course')
  .then((user) => {

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

    res.render("profile/profileEdit", {
      user,
      optionsCourse,
      optionsLocation,
    });
  })
  .catch((err) => next(err));
});

// edit profile
router.post('/:id', uploader.single('photo'), async (req, res, next) => {
  const { email, name, lastName, course, location, website, github, profilePicture } = req.body;
  const deletePhoto = await cloudinary.uploader.destroy(req.user.profilePicture.publicId);
  const updateProfile = await User.findByIdAndUpdate(req.params.id, { email, name, lastName, course, location, website, github, profilePicture: { imgPath: req.file.path, publicId: req.file.filename} })
  Promise.all([deletePhoto, updateProfile])
  console.log('req.user', req.user, 'req.body', req.body, 'req.params', req.params)
  .then(() => res.redirect('/profile/{{_id}}'))
})

module.exports = router;
