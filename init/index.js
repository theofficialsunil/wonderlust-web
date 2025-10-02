const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('./../models/listing');

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then((res)=>{
        console.log('✅ Connected to DB');
    })
    .catch((err)=>{
        console.error('❌ Database connection error:', err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log('data initialized');
}

initDB();