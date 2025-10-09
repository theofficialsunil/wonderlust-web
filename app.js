const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

//middle-wares
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('ejs',ejsMate);

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

app.get("/listings", async (req, res, next) => {
  try {
    let alllistings = await Listing.find({});
    res.render("listings/index.ejs", {
      title: "All Listings",
      listings: alllistings,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

app.get("/listings/:id", async (req, res, next) => {
    let { id } = req.params;
    try {
        let listing = await Listing.findById(id);
        res.render("listings/show.ejs", { listing });
    }
    catch (err) {
        next(err);
    }
});

app.get("/listings/:id/edit", async (req, res, next) => {
    let { id } = req.params;
    try {
        let listing = await Listing.findById(id);
        res.render("listings/edit.ejs", { listing });
    }
    catch (err) {
        next(err);
    }
});

app.put("/listings/:id", async (req, res, next) => {
    let { id } = req.params;
    try {
        let updated = await Listing.findByIdAndUpdate(id, req.body, { runValidator: true, new: true });
        console.log(updated);
        res.redirect(`/listings/${id}`);
    }
    catch (err) {
        next(err)
    }
})

app.delete("/listings/:id", async (req, res, next) => {
    let { id } = req.params;
    try {
        let deleted_listing = await Listing.findByIdAndDelete(id);
        console.log(deleted_listing);
        res.redirect(`/listings`);
    }
    catch (err) {
        // console.log(`error occured while deletion :- ${err}`);
        next(err);
    }
});


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
