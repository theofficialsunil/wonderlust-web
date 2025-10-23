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
    initData.data = initData.data.map((obj) => ({...obj,owner:"68f87adbe62c171acd22b15d"}))
    await Listing.insertMany(initData.data);
    console.log('data initialized');
}

initDB();