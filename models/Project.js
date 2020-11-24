const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const projectSchema = new Schema(
  {
    title: String,
    describtion: String,
    owner: [{ type: Schema.Types.ObjectId, ref: User }],
    lookingFor: String,
    tags: String,
    deadline: Number,
    attachments: String,
    applicants: [{ type: Schema.Types.ObjectId, ref: User }],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
