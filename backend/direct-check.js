require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const listings = await db.collection('listings').find({}).toArray();
  console.log(`📦 ${listings.length} annonces dans la collection`);
  listings.forEach(l => {
    console.log(`- ${l.title} | ${l.price}`);
  });
  process.exit(0);
});
