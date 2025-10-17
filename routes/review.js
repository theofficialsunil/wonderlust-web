const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');

// ** For Schema validation we use `joi` (npm-package);
const { reviewSchema } = require('../schema');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');

//we have to use {mergeParams:true} :- for child routes

// middle ware for validating - review Schema
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg)
    }
    else {
        next();
    }
}

router.post("/",validateReview,wrapAsync(async (req,res,next) =>{
    let {id} = req.params;
    let review = req.body.review;

    let listing = await Listing.findById(id);
    let newReview = new Review(review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log('new Review saved in DB');

    res.redirect(`/listings/${id}`);
}));

router.delete("/:reviewId",wrapAsync(async (req,res,next) => {
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

module.exports = router;