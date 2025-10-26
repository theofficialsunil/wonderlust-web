const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const {
    index,
    renderNewForm,
    createListing,
    showListing,
    renderEditForm,
    updateListing,
    destroyListing,
} = require("../controllers/listing.js");

router
    .route("/")
    .get(wrapAsync(index))
    .post(isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(createListing));

router.get("/new", isLoggedIn, renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(showListing))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(renderEditForm));

module.exports = router;
