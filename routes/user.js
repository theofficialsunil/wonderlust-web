const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const review = require("../models/review.js");
const { saveRedirectUrl } = require("../middleware.js");
const {
    signup,
    renderSignupForm,
    renderLoginForm,
    login,
    logout,
} = require("../controllers/user.js");

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

module.exports = router;
