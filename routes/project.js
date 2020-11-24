const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require('connect-ensure-login');

router.get("/projects", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.find().then((allProjects) => {
    res.render("project/board", { allProjects });
  });
});

router.get("/new-project", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("project/new_project");
});

router.get("/projects/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id).populate("owner")
    .then((project) => {
      res.render("project/project_details", { project });
    });
});

router.get("/projects/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id).populate('owner')
    .then((project) => {
      res.render("project/edit_project", { project });
    })
});

router.get("/projects/:id/delete", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/projects"))
});

router.post("/projects", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, lookingFor, tags } = req.body;
  Project.create({ title, description, deadline, lookingFor, owner: req.user })
  .then(() => res.redirect('projects'))
});

router.post("/projects/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, lookingFor, tags, applicants, team } = req.body;
  Project.findByIdAndUpdate(req.params.id, { title, description, lookingFor, tags, deadline, applicants, team })
    .then(() => res.redirect('/projects'))
});

module.exports = router;
