const Listing = require("../models/listing.js");

module.exports.index = async (req, res, next) => {
    let alllistings = await Listing.find({});
    res.render("listings/index.ejs", {
        title: "All Listings",
        listings: alllistings,
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    console.log(res.locals.currentUser);
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    // console.log(`added-Listing :- `, newListing);
    req.flash("success", "New Listing Added");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    let updated = await Listing.findByIdAndUpdate(id, req.body.listing, {
        runValidators: true,
        new: true,
    });
    console.log(updated);
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
    let { id } = req.params;
    let deleted_listing = await Listing.findByIdAndDelete(id);
    console.log(deleted_listing);
    req.flash("success", "Listing deleted!");
    res.redirect(`/listings`);
};
