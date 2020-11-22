const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

router.get('/signup', (req, res) => res.render('auth/signup'));
router.get('/login', (req, res) => res.render('auth/login'));

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
    failureRedirect: '/login'
  })
)

router.post('/google', passport.authenticate('local', { 
  successRedirect: '/', 
  failureRedirect: '/login'
  })
)

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    passReqToCallback: true
  })
);

router.post('/signup', (req, res, next) => {
  const { username, password, course, location } = req.body;
  if (password.length < 8) {
    return res.render('auth/signup', { message: 'Password must be at least 8 characters' });
  }
  User.findOne( { username })
  .then((user) => {
    if (user !== null) {
      return res.render('auth/signup', { message: 'This username has already been taken' });
    } else {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);
      User.create( { username, password: hash, course, location })
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
  })
})


module.exports = router;