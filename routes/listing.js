const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema} = require('../schema');
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');

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

router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.post("/",validateListing ,wrapAsync(async (req, res, next) => {
    let addedListing = await Listing.create(req.body.listing);
    console.log(`added-Listing :- `, addedListing);
    res.redirect("/listings");
})
);

router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
})
);

router.get("/:id/edit", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
);

router.put("/:id",validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let updated = await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });
    console.log(updated);
    res.redirect(`/listings/${id}`);
})
);

router.delete("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deleted_listing = await Listing.findByIdAndDelete(id);
    console.log(deleted_listing);
    res.redirect(`/listings`);
})
);

module.exports = router;