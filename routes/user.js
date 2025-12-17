const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig");
const upload = multer({ storage });
const User = require("../models/user");
const { isLoggedIn, saveRedirectUrl } = require("../middleware");

const {
  signup,
  renderSignupForm,
  renderLoginForm,
  login,
  logout,
} = require("../controllers/user");


router.get("/signup", renderSignupForm);
router.post("/signup", signup);

router.get("/login", renderLoginForm);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  login
);

router.get("/logout", logout);

router.get("/user/profile", isLoggedIn, (req, res) => {
  res.render("users/profile.ejs");
});

router.get("/users/:id/edit", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("users/edit.ejs", { user });
});

router.put(
  "/users/:id",
  isLoggedIn,
  upload.single("profilePhoto"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, username } = req.body;

      if (!name || !username) {
        req.flash("error", "Name and username are required");
        return res.redirect("back");
      }

      const user = await User.findById(id);
      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("back");
      }

      // ownership check
      if (!user._id.equals(req.user._id)) {
        req.flash("error", "You are not allowed to edit this profile");
        return res.redirect("/user/profile");
      }

      if (username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          req.flash("error", "Username already taken");
          return res.redirect("back");
        }
        user.username = username;
      }

      user.name = name;

      if (req.file) {
        user.profilePhoto = req.file.path; 
      }

      await user.save();

      req.flash("success", "Profile updated successfully!");
      res.redirect("/user/profile");

    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
