var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password:  { type: String, required: true },
  name:  { type: String, required: true },
  age:  { type: Number }
})

module.exports = mongoose.model('user', UserSchema)