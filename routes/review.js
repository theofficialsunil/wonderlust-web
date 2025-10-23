const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isAuthor, validateReview } = require('../middleware.js');
const { createReview, destroyReview } = require('../controllers/review.js');

//we have to use {mergeParams:true} :- for child routes


router.post("/",isLoggedIn,validateReview,wrapAsync(createReview));
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(destroyReview));

module.exports = router;