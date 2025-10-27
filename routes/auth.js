const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/choose-username",
    (req,res)=>{
        const { googleId } = req.query; // retrieved from URL query
        res.render("users/chooseUsername.ejs", { googleId });
    }
)

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user.username) {
      return res.redirect(`/auth/choose-username?googleId=${req.user.googleId}`);
    }

    req.flash("success", "Successfully logged In");

    res.redirect("/listings");
  }
);

router.post("/save-username", async (req, res, next) => {
  const { googleId, username } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      req.flash("error", "Username already exists!");
      return res.redirect(`/choose-username?googleId=${googleId}`);
    }

    const user = await User.findOneAndUpdate(
      { googleId },
      { username },
      { new: true }
    );

    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/login");
    }

    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Successfully logged In");
      res.redirect("/listings");
    });
  } catch (err) {
    console.error("Error saving username:", err);
    req.flash("error", "Something went wrong!");
    res.redirect("/login");
  }
});


module.exports = router;
