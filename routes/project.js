const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require("connect-ensure-login");

// display all projects
router.get("/", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user;
  console.log(user);
  Project.find().then((allProjects) => {
    res.render("project/projects", { allProjects, user });
  });
});

// display add project form
router.get("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user;
  let optionsLocation = "";
  [
    "Amsterdam",
    "Barcelona",
    "Berlin",
    "Lisbon",
    "Madrid",
    "Mexico City",
    "Miami",
    "Paris",
    "São Paulo",
    "Remote",
  ].forEach((location) => {
    let selectedLocation = "";
    selectedLocation = req.user.location === location ? " selected" : "";
    optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`;
  });
  res.render("project/new_project", { optionsLocation, user });
});

// display project details
router.get("/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user;
  Project.findById(req.params.id)
    .populate("owner")
    .populate("applicants")
    .populate("team")
    .then((project) => {
      project.isOwner = project.owner[0]._id == user;
      res.render("project/project_details", { project, user });
    });
});

// display edit project form
router.get("/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.session.passport.user;
  Project.findById(req.params.id)
    .populate("owner")
    .then((project) => {
      let optionsLocation = "";
      [
        "Amsterdam",
        "Barcelona",
        "Berlin",
        "Lisbon",
        "Madrid",
        "Mexico City",
        "Miami",
        "Paris",
        "São Paulo",
        "Remote",
      ].forEach((location) => {
        let selectedLocation = "";
        selectedLocation = req.user.location === location ? " selected" : "";
        optionsLocation += `<option value='${location}' ${selectedLocation}>${location}</option>`;
      });
      res.render("project/edit_project", { project, optionsLocation, user });
    });
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
  console.log("body", req.body, "params", req.params);
  Project.findById(req.params.id)
    .then((project) => {
      if (!project.applicants.includes(req.user._id)) {
        Project.findByIdAndUpdate(req.params.id, {
          $push: { applicants: req.user._id },
        }).then(() => res.redirect("/profile"));
      } else {
        res.render("project/project_details", {
          message: "You have aplready applied for this project",
        });
      }
    })
    .catch((err) => next(err));
});

// add project
router.post("/new", ensureLogin.ensureLoggedIn(), (req, res) => {
  const {
    title,
    description,
    deadline,
    webdev,
    uxui,
    data,
    location,
    tags,
  } = req.body;
  Project.create({
    title,
    description,
    deadline,
    lookingFor: { webdev, uxui, data },
    owner: req.user._id,
    location,
  }).then(() => res.redirect("/projects"));
});

// edit project
router.post("/:id/edit", ensureLogin.ensureLoggedIn(), (req, res) => {
  const {
    title,
    description,
    deadline,
    webdev,
    uxui,
    data,
    location,
    tags,
    applicants,
    team,
  } = req.body;
  // console.log('req.params.id', req.params.id,'req.body', req.body)
  Project.findByIdAndUpdate(req.params.id, {
    title,
    description,
    lookingFor: { webdev, uxui, data },
    location,
    tags,
    deadline,
    applicants,
    team,
  }).then(() => res.redirect("/projects"));
});

// approving / rejecting applicants
router.post("/:id/apply", ensureLogin.ensureLoggedIn(), (req, res) => {
  const id = req.user.id;
  if (req.body[id] === "approve") {
    Project.findByIdAndUpdate(req.params.id, {
      $push: { team: id },
      $pull: { applicants: id },
    }).then(() => res.redirect("/projects")); //replace with project details page
  }
  if (req.body[id] === "reject") {
    Project.findByIdAndUpdate(req.params.id, {
      $pull: { applicants: id },
    }).then(() => res.redirect("/projects")); //replace with project details page
  }
});

// filter projects
router.post("/", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { searchBar, searchLoc } = req.body;
  const filtered = [];
  if (searchBar !== "Choose..." && searchLoc !== "Choose...") {
    Project.find()
      .then((found) => {
        found.forEach((project, index) => {
          if (
            (project.lookingFor[searchBar] !== null ||
              project.lookingFor[searchBar] !== 0) &&
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
          if (
            project.lookingFor[searchBar] !== null ||
            project.lookingFor[searchBar] !== 0
          ) {
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
