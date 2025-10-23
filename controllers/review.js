const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res, next) => {
    let { id } = req.params;
    let review = req.body.review;

    let listing = await Listing.findById(id);
    let newReview = new Review(review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("new Review saved in DB");
    req.flash("success", "New Review Added");

    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res, next) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`);
};
