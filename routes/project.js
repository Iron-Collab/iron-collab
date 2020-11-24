const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require('connect-ensure-login');

// display all projects
router.get("/", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.find().then((allProjects) => {
    res.render("project/projects", { allProjects });
  });
});

// display add project form
router.get("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
    let optionsLocation = '';
    ['Amsterdam', 'Barcelona', 'Berlin', 'Lisbon', 'Madrid', 'Mexico City', 'Miami', 'Paris', 'São Paulo', 'Remote'].forEach((location) => {
      let selectedLocation = '';
      selectedLocation = (req.user.location === location) ? ' selected' : '';
      optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`
    })
    res.render("project/new_project", { optionsLocation });
});

// display project details
router.get("/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id).populate("owner")
    .then((project) => {
      res.render("project/project_details", { project });
    });
});

// display edit project form
router.get("/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id).populate('owner')
  .then((project) => {
    console.log('PROJECT', project)
    let optionsLocation = '';
    ['Amsterdam', 'Barcelona', 'Berlin', 'Lisbon', 'Madrid', 'Mexico City', 'Miami', 'Paris', 'São Paulo', 'Remote'].forEach((location) => {
      let selectedLocation = '';
      selectedLocation = (req.user.location === location) ? ' selected' : '';
      optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`
    })
    res.render("project/edit_project", { project, optionsLocation });
  })
});

// delete project
router.get("/:id/delete", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/projects"))
});

// add project
router.post("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, webdev, uxui, data, tags } = req.body;
  Project.create({ title, description, deadline, lookingFor: {webdev, uxui, data}, owner: req.user._id, location: req.user.location })
  .then(() => res.redirect('/projects'))
});

// edit project
router.post("/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, webdev, uxui, data, location, tags, applicants, team } = req.body;
  Project.findByIdAndUpdate(req.params.id, { title, description, lookingFor: {webdev, uxui, data}, location, tags, deadline, applicants, team })
    .then(() => res.redirect('/projects'))
})

// filter projects
router.post("/", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { searchBar, searchLoc } = req.body;
  const filtered = [];
  Project.find()
    .then((found) => {
      found.forEach((project, index) => {
        if (project.lookingFor[searchBar] !== null) {
          filtered.push(project);
        }
      });
    })
    .then(() => {
      res.render("project/projects", { allProjects: filtered });
    });
});


module.exports = router;
