const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;

app.set()
main();
async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log('✅ Connected to DB');
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}

app.get("/",(req,res)=>{
    res.send(`This is root`);
})
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});