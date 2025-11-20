require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({});
  console.log('👥 Utilisateurs en base:', users.length);
  users.forEach(u => {
    console.log(`- ${u.fullName} | ${u.email} | ${u.phone}`);
  });
  process.exit(0);
});
