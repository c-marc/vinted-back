const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // get token
    const token = req.headers.authorization.replace("Bearer ", "");
    // console.log(token);

    // check token and drop sensitive info
    const user = await User.findOne({ token: token }).select("account");

    // ok
    if (user) {
      // forward sanitized user content to next func
      req.user = user;
      return next(); // dont forget to return explicitely when it's not the end of the code function
    }
  }

  // else
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = isAuthenticated;
