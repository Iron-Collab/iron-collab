const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require("connect-ensure-login");
var ObjectId = require('mongoose').Types.ObjectId;


// display all projects
router.get("/", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user;
  Project.find().then((allProjects) => {
    res.render("project/projects", { allProjects, user });
  });
});

// display add project form
router.get("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user;
  let optionsLocation = "";
  [ "Amsterdam", "Barcelona", "Berlin", "Lisbon", "Madrid", "Mexico City", "Miami", "Paris", "São Paulo", "Remote"].forEach((location) => {
    let selectedLocation = "";
    selectedLocation = req.user.location === location ? " selected" : "";
    optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`;
  });
  res.render("project/new_project", { optionsLocation, user });
});

// display project details
router.get("/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user
  Project.findById(req.params.id).populate("owner").populate("applicants").populate("team")
    .then((project) => {
      project.isOwner = project.owner[0]._id == user;
      project.isApplicant = false;
      for (let applicant of project.applicants) {
        if (applicant._id == user) {
          project.isApplicant = true
        }
      }
      project.isMember = false;
      for (let member of project.team) {
        if (member._id == user) {
          project.isMember = true
        }
      }
      project.canApply = !project.isApplicant && !project.isMember && !project.isOwner
      // console.log('isApplicant', project.isApplicant, 'isMember', project.isMember, 'canApply', project.canApply)
      res.render("project/project_details", { project, user });
    });
});

// display edit project form
router.get("/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user
  Project.findById(req.params.id).populate('owner')
  .then((project) => {
    let optionsLocation = '';
    ['Amsterdam', 'Barcelona', 'Berlin', 'Lisbon', 'Madrid', 'Mexico City', 'Miami', 'Paris', 'São Paulo', 'Remote'].forEach((location) => {
      let selectedLocation = '';
      selectedLocation = (req.user.location === location) ? ' selected' : '';
      optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`
    })
    res.render("project/edit_project", { project, optionsLocation, user });
  })
});

// delete project
router.get("/:id/delete", ensureLogin.ensureLoggedIn(), (req, res) => {
  if (req.user._id === owner.query.schema.paths.owner[0])
  Project.findByIdAndDelete(req.params.id).then(() =>
    res.redirect("/projects")
  );
});

// apply to project
router.get("/:id/apply", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Project.findById(req.params.id)
  .then((project) => {
    if (!project.applicants.includes(req.user._id) && !project.team.includes(req.user._id)){
      Project.findByIdAndUpdate(req.params.id, {
        $push: {applicants: req.user._id }
      }).then(() => res.redirect(`/profile`));
    } else {
      res.render('project/project_details', { alert: 'You have already applied for this project'})
    }
  })
  .catch(err => next(err))
});

// withdraw application or from the project
router.get("/:id/withdraw", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Project.findById(req.params.id)
  .then((project) => {
    if (project.applicants.includes(req.user._id)){
      Project.findByIdAndUpdate(req.params.id, {
        $pull: {applicants: req.user._id }
      })
      .then(() => {console.log('withdraw application, success')})
    } 
    if (project.team.includes(req.user._id)){
      Project.findByIdAndUpdate(req.params.id, {
        $pull: {team: req.user._id }
      })
      .then(() => {console.log('withdraw from team, success')})
    } 
  })
  .then(() => res.redirect(`/profile`))
  .catch(err => next(err))
});

// add project
router.post("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, webdev, uxui, data, location, tags } = req.body;
  Project.create({ title, description, deadline, lookingFor: {webdev, uxui, data}, owner: req.user._id, location })
  .then(() => res.redirect('/projects'))
});

// edit project
router.post("/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, description, deadline, webdev, uxui, data, location, tags, applicants, team } = req.body;
  // console.log('req.params.id', req.params.id,'req.body', req.body)
  Project.findByIdAndUpdate(req.params.id, { title, description, lookingFor: { webdev, uxui, data }, location, tags, deadline, applicants, team })
  .then(() => res.redirect("/projects"));
});

// approving / rejecting applicants
router.post("/:id/applicants", ensureLogin.ensureLoggedIn(), (req, res) => {

  if (req.body.action === 'accept') {
    Project.findByIdAndUpdate(req.params.id, {
        $push: { team: req.body.memberId }, 
        $pull: { applicants: req.body.memberId }
    }, { new: true })
    .then(() => res.redirect(`/projects/${req.params.id}`)) 

  } else if (req.body.action === 'reject') {
    Project.findByIdAndUpdate(req.params.id, 
      { $pull: { applicants: req.body.memberId }}, 
      { new: true }
    )
    .then(() => res.redirect(`/projects/${req.params.id}`)) 
  }
})

//deleting team members
router.post("/:id/team", ensureLogin.ensureLoggedIn(), (req, res) => {

  Project.findByIdAndUpdate(req.params.id, 
    { $pull: { team: req.body.memberId }}, 
    { new: true }
  )
  .then(() => res.redirect(`/projects/${req.params.id}`))
})

// filter projects
router.post("/", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { searchBar, searchLoc } = req.body;
  Project.find()
    .then((projects) => {
      const filtered = projects.filter(project => {
        return (project.location === searchLoc || !searchLoc) && project.lookingFor[searchBar] > 0 ;
      })
      res.render('project/projects', { allProjects: filtered })
    })
    .catch(err => console.log(err))
});


module.exports = router;
