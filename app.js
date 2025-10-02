const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const Listing = require('./models/listing.js');
const path = require('path');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));

app.set()
main();
async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
        console.log('✅ Connected to DB');
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}

app.get("/", (req, res) => {
    res.send(`This is root`);
});

app.get("/testListing", (req, res) => {
    res.send('listing saved!');
})

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});