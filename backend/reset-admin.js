require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.deleteOne({ email: 'edemkukuz+admin@gmail.com' });
  
  await User.create({
    fullName: 'Super Admin TogoMarket',
    phone: '+22890000001',
    email: 'edemkukuz+admin@gmail.com',
    password: 'Admin2024',
    role: 'superadmin',
    isVerified: true,
    isPhoneVerified: true,
    city: 'Lomé'
  });
  
  console.log('✅ Admin recréé');
  console.log('Email: edemkukuz+admin@gmail.com');
  console.log('Password: Admin2024');
  process.exit(0);
});
