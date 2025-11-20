require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    await User.deleteMany({});
    console.log('🧹 Base nettoyée');

    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    
    await User.create({
      fullName: 'Edy Test',
      phone: '+22890123456',
      email: 'edemkukuz+admin@gmail.com',
      password: hashedPassword,
      isVerified: true,
      city: 'Lomé'
    });

    console.log('✅ Utilisateur créé');
    console.log('📧 Email: edemkukuz+admin@gmail.com');
    console.log('🔑 Password: Test1234!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedData();
