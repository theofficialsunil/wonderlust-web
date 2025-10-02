const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

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

app.get("/listings", async (req, res) => {
    try {
        let alllistings = await Listing.find({});
        res.render("listings/index.ejs",{listings : alllistings});
    }
    catch(err) {
        console.log(err);
    }
});

app.get("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    try {
        let listing = await Listing.findById(id);
        res.render("listings/show.ejs",{listing});
    }
    catch(err){
        console.log(err);
    }
});

app.get("/listings/:id/edit",async (req,res)=>{
    let {id} = req.params;
    try {
        let listing = await Listing.findById(id);
        res.render("listings/edit.ejs",{listing});
    }
    catch(err){
        console.log(err);
    }
});

app.put("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    try {
        let updated = await Listing.findByIdAndUpdate(id,req.body,{runValidator:true,new:true});
        console.log(updated);
        res.redirect(`/listings/${id}`);
    }
    catch(err) {
        console.log(err);
    }
})

app.delete("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    try {
        let deleted_listing = await Listing.findByIdAndDelete(id);
        console.log(deleted_listing);
        res.redirect(`/listings`);
    }
    catch(err) {
        console.log(`error occured while deletion :- ${err}`);
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
