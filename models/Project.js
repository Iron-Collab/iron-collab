const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: String,
  describtion: String,
  owner: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lookingFor: String,
  tags: String,
  deadline: Number,
  attachments: String,
  applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
