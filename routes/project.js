const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require("connect-ensure-login");

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
  console.log(req.params.id)
  Project.findById(req.params.id)
  .then(project => {
    for (let applicant of project.applicants) {
      if (req.body[applicant] === 'approve') {
        Project.findByIdAndUpdate(req.params.id, {
            $push: { team: applicant }, 
            $pull: { applicants: applicant }
        })
        .then(() => {console.log('approved, success')})
      } else if (req.body[applicant] === 'reject') {
        Project.findByIdAndUpdate(req.params.id, {
          $pull: { applicants: applicant }
        })
        .then(() => {console.log('rejected, success')})
      }
    }
  })
  .then(() => {console.log('SUCCESS')})
  .then(() => res.redirect(`/projects/${req.params.id}`)) 
})

//deleting team members
router.post("/:id/team", ensureLogin.ensureLoggedIn(), (req, res) => {
  Project.findById(req.params.id)
  .then(project => {
    for (let member of project.team) {
      if (req.body[member] == 'delete') {
        Project.findByIdAndUpdate(req.params.id, {
            $pull: { team: member }
        })
        .then(() => console.log('deleted, success'))
        // .then(() => res.redirect(`/projects/${req.params.id}`))
      } 
    }
  })
  .then(() => res.redirect(`/projects/${req.params.id}`))
})

// filter projects
router.post("/", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { searchBar, searchLoc } = req.body;
  const filtered = [];
  if (searchBar !== "Choose..." && searchLoc !== "Choose...") {
    Project.find()
      .then((found) => {
        found.forEach((project, index) => {
          if (
            (project.lookingFor[searchBar] !== null || project.lookingFor[searchBar] !== 0) &&
            project.location == searchLoc
          ) {
            filtered.push(project);
          }
        });
      })
      .then(() => {
        res.render("project/projects", { allProjects: filtered });
      });
  } else if (searchBar === "Choose..." && searchLoc !== "Choose...") {
    Project.find()
      .then((found) => {
        found.forEach((project, index) => {
          if (project.location == searchLoc) {
            filtered.push(project);
          }
        });
      })
      .then(() => {
        res.render("project/projects", { allProjects: filtered });
      });
  } else if (searchBar !== "Choose..." && searchLoc === "Choose...") {
    Project.find()
      .then((found) => {
        found.forEach((project, index) => {
          if (project.lookingFor[searchBar] !== null || project.lookingFor[searchBar] !== 0) {
            filtered.push(project);
          }
        });
      })
      .then(() => {
        res.render("project/projects", { allProjects: filtered });
      });
  }
});

module.exports = router;
