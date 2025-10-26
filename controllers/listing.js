const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");

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
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    
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
    try {
        let { id } = req.params;
        let updated = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { runValidators: true, new: true }
        );

        // If new file uploaded
        if (req.file) {
            // Delete old image if exists
            if (updated.image && updated.image.filename) {
                await cloudinary.uploader.destroy(updated.image.filename);
            }

            // Add new image data
            updated.image = {
                url: req.file.path,
                filename: req.file.filename
            };

            await updated.save();
        }

        req.flash("success", "Listing Updated Successfully!");
        res.redirect(`/listings/${id}`);

    } catch (err) {
        console.error("UPDATE ERROR:", err);
        req.flash("error", "Failed to update listing!");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.destroyListing = async (req, res, next) => {
    let { id } = req.params;
    let deleted_listing = await Listing.findByIdAndDelete(id);
    console.log(deleted_listing);
    req.flash("success", "Listing deleted!");
    res.redirect(`/listings`);
};
