const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const newUser = new User({ name, username, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) throw err;
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Logged In!");
    let redirectUrl = res.locals.redirectUrl || "/listings";

    //  Remove any invalid method-override query parameters
    if (redirectUrl.includes("_method=")) {
        // Extract just the base path (before ?_method=)
        redirectUrl = redirectUrl.split("?_method=")[0];
    }
    delete req.session.redirectUrl; // cleanup
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', "Successfully logged out!");
    res.redirect('/listings');
  });
};