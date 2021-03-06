const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { uploader, cloudinary } = require('../config/cloudinary');

// router.get('/signup', (req, res) => res.render('auth/signup'));
// router.get('/login', (req, res) => res.render('auth/login'));
router.get('/signin', (req, res) => res.render('auth/signin'));


router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

router.get('/google', passport.authenticate("google", {
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}))

router.get('/auth/google/callback', passport.authenticate('google', { 
    successRedirect: '/', 
    failureRedirect: '/signin'
  })
)

router.post('/google', passport.authenticate('local', { 
  successRedirect: '/profile', 
  failureRedirect: '/signin'
  })
)

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    passReqToCallback: true
  })
);

router.post('/signup', uploader.single('photo'), (req, res, next) => {
  const { email, password, name, lastName, course, location, website, github } = req.body;
  if (password.length < 8) {
    return res.render('auth/signin', { message: 'Password must be at least 8 characters' });
  }
  User.findOne({ email })
  .then((user) => {
    if (user !== null) {
      return res.render('auth/signin', { message: 'This email has already been taken' });
    } else {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);
      if (req.file) {
        User.create( { email, password: hash, name, lastName, course, location, website, github, profilePicture: { imgPath: req.file.path, publicId: req.file.filename} })
        .then(dbUser => {
          req.login(dbUser, err => {
            if (err) {
              next(err);
            } else {
              res.redirect('/')
            }
          })
        })
        .catch(err => next(err));
        } else {
          console.log('ROUTE WITHOUT PICTURE')
          User.create( { email, password: hash, name, lastName, course, location, website, github })
          .then(dbUser => {
            req.login(dbUser, err => {
              if (err) {
                next(err);
              } else {
                res.redirect('/')
              }
            })
          })
          .catch(err => next(err));
        }
    }
  })
})


module.exports = router;