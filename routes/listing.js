const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const ExpressError = require('../utils/ExpressError.js');
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');
const { index, renderNewForm, createListing, showListing, renderEditForm, updateListing, destroyListing } = require('../controllers/listing.js');


router.get("/", wrapAsync(index));

router.get("/new",isLoggedIn,renderNewForm);

router.post("/",isLoggedIn,validateListing,wrapAsync(createListing));

router.get("/:id", wrapAsync(showListing));

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(renderEditForm));

router.put("/:id",isLoggedIn,validateListing,isOwner,wrapAsync(updateListing));

router.delete("/:id",isOwner,isLoggedIn,isOwner,wrapAsync(destroyListing));

module.exports = router;