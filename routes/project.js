const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require('connect-ensure-login');

router.get("/", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.find().then((allProjects) => {
    res.render("project/projects", { allProjects });
  });
});

router.get("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("project/new_project");
});

router.get("/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id).populate("owner")
    .then((project) => {
      res.render("project/project_details", { project });
    });
});

router.get("/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id).populate('owner')
    .then((project) => {
      res.render("project/edit_project", { project });
    })
});

router.get("/:id/delete", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/projects"))
});

router.post("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, lookingFor, tags } = req.body;
  Project.create({ title, description, deadline, lookingFor, owner: req.user })
  .then(() => res.redirect('projects'))
});

router.post("/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, lookingFor, tags, applicants, team } = req.body;
  Project.findByIdAndUpdate(req.params.id, { title, description, lookingFor: {webDev, uxUi, data}, tags, deadline, applicants, team })
    .then(() => res.redirect('/projects'))
})

// FELIX
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
