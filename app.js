const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

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
        await mongoose.connect(process.env.ATLAS_DB_URL);
        console.log('✅ Connected to DB');
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}

app.get("/", (req, res) => {
    res.send(`This is root`);
});

const Store = MongoStore.create({
    mongoUrl:process.env.ATLAS_DB_URL,
    crypto:{
        secret:process.env.COOKIE_SECRET,
    },
    touchAfter:24 * 3600 * 1000,
});

Store.on("error",(err)=>{
    console.log('Error in Mongo Session Store',err);
})
app.use(session({
    store:Store,
    secret:process.env.COOKIE_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         name:"Sunil Nagar",
//         email:"student123@gmail.com",
//         username:"student",
//     });

//     let registeredUser = await User.register(fakeUser,"demo-password");
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

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
