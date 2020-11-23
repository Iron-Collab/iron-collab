const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  googleID: String,
  profilePicture: {
    type: String,
    default: 'images/profile.png'
  },
  course: {
    type: String,
    enum: ['Web Development', 'UX/UI Design', 'Data Analytics', 'Cybersecurity']
  },
  location: {
    type: String,
    enum: ['Amsterdam', 'Barcelona', 'Berlin', 'Lisbon', 'Madrid', 'Mexico City', 'Miami', 'Paris', 'São Paulo', 'Remote']
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;