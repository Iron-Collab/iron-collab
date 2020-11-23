const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  password: String,
  googleID: String,
  name: String,
  lastName: String,
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
  },
  role: { 
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;