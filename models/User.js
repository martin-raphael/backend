const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name:String,
  email:String,
  password:String,
  email: String,
  dateOfBirth: Date,
  verified: Boolean,
});

const User = mongoose.model("User", userSchema);
module.exports = User;