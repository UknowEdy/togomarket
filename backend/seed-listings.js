require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'edemkukuz+admin@gmail.com' });
  
  await Listing.deleteMany({});
  
  await Listing.create([
    {
      title: 'iPhone 14 Pro Max 256GB Noir',
      description: 'Téléphone en excellent état avec boîte et tous les accessoires originaux. Acheté il y a 6 mois.',
      category: 'phones-tablets',
      price: 450000,
      isNegotiable: true,
      condition: 'excellent',
      location: { city: 'Lomé' },
      seller: user._id,
      status: 'active'
    },
    {
      title: 'Yamaha 125cc 2022 - Papiers à jour',
      description: 'Moto récente, très bien entretenue. Révision complète faite. Tous les papiers sont à jour.',
      category: 'motorcycles',
      price: 850000,
      isNegotiable: true,
      condition: 'excellent',
      location: { city: 'Lomé' },
      seller: user._id,
      status: 'active',
      isUrgent: true
    },
    {
      title: 'MacBook Pro M1 16GB RAM 512GB SSD',
      description: 'Ordinateur portable Apple M1 en très bon état. Utilisé pour le développement. Sous garantie.',
      category: 'electronics',
      price: 950000,
      isNegotiable: true,
      condition: 'good',
      location: { city: 'Kara' },
      seller: user._id,
      status: 'active'
    }
  ]);
  
  console.log('✅ 3 annonces ACTIVES créées');
  process.exit(0);
});
