require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'edemkukuz+admin@gmail.com' }).select('+password');
  console.log('Utilisateur trouvé:', user.fullName);
  console.log('Password hash:', user.password);
  
  const isMatch = await user.comparePassword('Test1234!');
  console.log('Password Test1234! match:', isMatch);
  
  process.exit(0);
});
