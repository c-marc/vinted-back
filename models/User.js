const mongoose = require("mongoose");

const userSchema = {
  email: String,
  account: {
    username: String,
    avatar: Object, // nous verrons plus tard comment uploader une image
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
};

const User = mongoose.model("User", userSchema);

module.exports = User;
