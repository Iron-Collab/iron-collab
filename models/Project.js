const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const projectSchema = new Schema(
  {
    title: String,
    description: String,
    owner: [{ type: Schema.Types.ObjectId, ref: User }],
    lookingFor: [String],
    tags: [String],
    deadline: Date,
    applicants: [{ type: Schema.Types.ObjectId, ref: User }],
    team: [{ type: Schema.Types.ObjectId, ref: User }],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    attachments: {
      imgPath: {
        type: String,
        default: 'images/profile.png'
      },
      publicId: String,
    },
  }, { timestamps: true }
  );

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
