module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        // because it reset after login hense we have to store req.session.redirectUrl in locals
        req.session.redirectUrl = req.originalUrl;
        req.flash('error','Please Logged In !');
        return res.redirect('/login');
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}