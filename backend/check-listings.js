require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const listings = await Listing.find({});
  console.log(`📦 ${listings.length} annonces en base`);
  listings.forEach(l => {
    console.log(`- ${l.title} | ${l.price} FCFA | ${l.category}`);
  });
  process.exit(0);
});
