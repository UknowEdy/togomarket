require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.deleteMany({});
  
  await User.create({
    fullName: 'Edy Test',
    phone: '+22890123456',
    email: 'edemkukuz+admin@gmail.com',
    password: 'password123',
    isVerified: true,
    city: 'Lomé'
  });
  
  console.log('✅ Utilisateur recréé');
  console.log('📧 Email: edemkukuz+admin@gmail.com');
  console.log('🔑 Password: password123');
  process.exit(0);
});
