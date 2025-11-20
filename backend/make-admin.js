require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.updateOne(
    { email: 'edemkukuz+admin@gmail.com' },
    { role: 'superadmin' }
  );
  console.log('✅ Utilisateur promu superadmin');
  process.exit(0);
});
