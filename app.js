const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

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

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

app.get("/", (req, res) => {
    res.send(`This is root`);
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
        message = "Invalid Listing ID";
    }

    res.status(status).render("error.ejs", { status, message });
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}/listings`);
});
