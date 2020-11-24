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
