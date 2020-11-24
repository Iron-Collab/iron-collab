const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

router.get("/projects", (req, res, next) => {
  Project.find().then((allProjects) => {
    console.log(allProjects);
    res.render("project/board", { allProjects });
  });
});

router.get("/new-project", (req, res, next) => {
  res.render("project/new_project");
});

router.get("/project-details/:id", (req, res, next) => {
  const projectId = req.params.id;
  Project.findById(projectId)
    .populate("owner")
    .then((projectDetails) => {
      console.log(projectDetails);
      res.render("project/project_details", { projectDetails });
    });
});

router.get("/my-projects", (req, res, next) => {
  const id = req.body.id;
  Project.find({ id })
    .then((found) => {
      res.render("profile/profile", { userProjects: found });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/new-project", (req, res, next) => {
  const { title, describtion, deadline, lookingFor } = req.body;
  Project.create({
    title,
    describtion,
    deadline,
    lookingFor,
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
