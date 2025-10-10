const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');

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

app.post("/listings", wrapAsync(async (req, res, next) => {
    let addedListing = await Listing.create(req.body);
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

app.put("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let updated = await Listing.findByIdAndUpdate(id, req.body, { runValidator: true, new: true });
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
        message = "Page Not Found";
    }

    res.status(status).render("error.ejs", { status, message });
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}/listings`);
});
