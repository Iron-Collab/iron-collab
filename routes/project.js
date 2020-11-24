const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const ensureLogin = require("connect-ensure-login");

router.get("/projects", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Project.find().then((allProjects) => {
    console.log(allProjects);
    res.render("project/board", { allProjects });
  });
});

router.get("/new-project", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("project/new_project");
});

router.get(
  "/project-details/:id",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const projectId = req.params.id;
    Project.findById(projectId)
      .populate("owner")
      .then((projectDetails) => {
        console.log(projectDetails);
        res.render("project/project_details", { projectDetails });
      });
  }
);

router.get("/my-projects", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const id = req.body.id;
  Project.find({ id })
    .then((found) => {
      res.render("profile/profile", { userProjects: found });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/projects", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { searchBar } = req.body;
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
      res.render("project/board", { allProjects: filtered });
    });
});

router.post("/new-project", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const { title, description, deadline, webDev, uxUi, data } = req.body;
  Project.create({
    title,
    description,
    deadline,
    lookingFor: {
      webDev,
      uxUi,
      data,
    },
    owner: req.user,
  })
    .then((newProject) => {
      console.log(newProject);
      res.render("project/board", { newProject });
    })
    .catch((err) => {
      console.log(err);
    });
});
module.exports = router;
