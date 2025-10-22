const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema} = require('../schema');
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');
const {isLoggedIn} = require('../middleware.js');

//middle-ware to validate-Listing Schema
const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else {
        next();
    }
}

router.get("/", wrapAsync(async (req, res, next) => {
    let alllistings = await Listing.find({});
    res.render("listings/index.ejs", {
        title: "All Listings",
        listings: alllistings,
    });
})
);

router.get("/new",isLoggedIn,(req, res) => {
    res.render("listings/new.ejs");
});

router.post("/",isLoggedIn,validateListing ,wrapAsync(async (req, res, next) => {
    let addedListing = await Listing.create(req.body.listing);
    console.log(`added-Listing :- `, addedListing);
    req.flash("success","New Listing Added");
    res.redirect("/listings");
})
);

router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
})
);

router.get("/:id/edit",isLoggedIn, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
);

router.put("/:id",isLoggedIn,validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let updated = await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });
    console.log(updated);
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
})
);

router.delete("/:id", isLoggedIn,wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deleted_listing = await Listing.findByIdAndDelete(id);
    console.log(deleted_listing);
    req.flash("success","Listing deleted!");
    res.redirect(`/listings`);
})
);

module.exports = router;