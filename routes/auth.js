const express = require("express");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");
const { uploadPicture } = require("../services/cloudinary");

const router = express.Router();

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, password, newsletter } = req.body;

    if (
      !email ||
      !username ||
      !password ||
      (newsletter !== true && newsletter !== false)
    ) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);

    const token = uid2(64);

    const newUser = new User({
      email,
      account: { username },
      newsletter,
      salt,
      hash,
      token,
    });

    if (req.files?.picture) {
      const picture = !Array.isArray(req.files.picture)
        ? req.files.picture
        : req.files.picture[0];
      const folder = "/vinted/users/" + offerToUpdate._id;

      const avatar = await uploadPicture(picture, folder);
      newUser.account.avatar = avatar;
    }

    await newUser.save();

    const securedUser = {
      email: newUser.email,
      account: newUser.account,
      token: newUser.token,
    };

    res.status(201).json(securedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // console.log(user);

    if (user === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const hash = SHA256(password + user.salt).toString(encBase64);
    if (user.hash !== hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const securedUser = {
      email: user.email,
      account: user.account,
      token: user.token,
    };

    res.json(securedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
