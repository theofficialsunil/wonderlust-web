const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');

// ** For Schema validation we use `joi` (npm-package);
const { listingSchema, reviewSchema } = require('./schema');

require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

//middle-wares
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('ejs', ejsMate);

const port = process.env.PORT || 8080;
main();
async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}

app.get("/", (req, res) => {
    res.send(`This is root`);
});

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


app.get("/listings", wrapAsync(async (req, res, next) => {
    let alllistings = await Listing.find({});
    res.render("listings/index.ejs", {
        title: "All Listings",
        listings: alllistings,
    });
})
);

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.post("/listings",validateListing ,wrapAsync(async (req, res, next) => {
    let addedListing = await Listing.create(req.body.listing);
    console.log(`added-Listing :- `, addedListing);
    res.redirect("/listings");
})
);

app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
})
);

app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
);

app.put("/listings/:id",validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let updated = await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });
    console.log(updated);
    res.redirect(`/listings/${id}`);
})
);

app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deleted_listing = await Listing.findByIdAndDelete(id);
    console.log(deleted_listing);
    res.redirect(`/listings`);
})
);

app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res,next) =>{
    let {id} = req.params;
    let review = req.body.review;

    let listing = await Listing.findById(id);
    let newReview = new Review(review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log('new Review saved in DB');

    res.redirect(`/listings/${id}`);
})) 


app.all(/.*/, (req, res) => {
    res.status(404).render("error.ejs", { status: 404, message: "Page Not Found" });
});

app.use((err, req, res, next) => {
    console.error("🔥 Error Caught by Handler:", err.stack);

    let status = err.status || 500;
    let message = err.message || "Something went wrong!";

    // ✅ If MongoDB ID is invalid — treat as 404 Not Found
    if (err.name === "CastError") {
        status = 404;
        message = "Invalid Listing ID";
    }

    res.status(status).render("error.ejs", { status, message });
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}/listings`);
});
