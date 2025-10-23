const Listing = require("./models/listing");
const { listingSchema} = require('./schema');
const ExpressError = require('./utils/ExpressError.js');
const Review = require('./models/review');
// ** For Schema validation we use `joi` (npm-package);
const { reviewSchema } = require('./schema');

//middle-ware to validate-Listing Schema
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else {
        next();
    }
}

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

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash('error', "Listing not found!");
            return res.redirect('/listings');
        }

        if (!res.locals.currentUser) {
            req.flash('error', "You must be logged in!");
            return res.redirect('/login');
        }

        if (!listing.owner.equals(res.locals.currentUser._id)) {
            req.flash('error', "You don't have permission to edit");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        console.error(err);
        req.flash('error', "Something went wrong");
        return res.redirect('/listings');
    }
};

module.exports.isAuthor = async (req,res,next) => {
    try {
        let {id,reviewId} = req.params;
        let review = await Review.findById(reviewId);

        if(!review) {
            req.flash('error',"review not found !");
            return res.redirect(`/listings/${id}`);
        }

        if(!review.author.equals(res.locals.currentUser._id)) {
            req.flash('error',"you are not the author of the review !");
            return res.redirect(`/listings/${id}`);
        }

        next();
    }
    catch(err) {
        console.log(err);
        req.flash('error','something went wrong');
        return res.redirect(`/listings/${id}`);
    }
}

// middle ware for validating - review Schema
module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg)
    }
    else {
        next();
    }
}