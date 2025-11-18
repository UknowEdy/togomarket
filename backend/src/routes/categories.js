const express = require('express');
const router = express.Router();

/**
 * @desc    Obtenir toutes les catégories
 * @route   GET /api/categories
 * @access  Public
 */
router.get('/', (req, res) => {
  const categories = [
    {
      id: 'phones-tablets',
      name: 'Téléphones & Tablettes',
      icon: '📱',
      subcategories: ['Smartphones', 'Tablettes', 'Accessoires', 'Pièces détachées']
    },
    {
      id: 'motorcycles',
      name: 'Motos & Scooters',
      icon: '🏍️',
      subcategories: ['Motos', 'Scooters', 'Pièces', 'Accessoires', 'Casques']
    },
    {
      id: 'cars',
      name: 'Voitures',
      icon: '🚗',
      subcategories: ['Voitures', 'SUV', 'Pick-up', 'Pièces auto', 'Accessoires']
    },
    {
      id: 'real-estate',
      name: 'Immobilier',
      icon: '🏠',
      subcategories: ['Appartements', 'Maisons', 'Terrains', 'Bureaux', 'Magasins', 'Location']
    },
    {
      id: 'fashion',
      name: 'Mode & Vêtements',
      icon: '👔',
      subcategories: ['Hommes', 'Femmes', 'Enfants', 'Chaussures', 'Sacs', 'Accessoires']
    },
    {
      id: 'electronics',
      name: 'Électronique',
      icon: '🔌',
      subcategories: ['Ordinateurs', 'TV & Audio', 'Appareils photo', 'Consoles', 'Accessoires']
    },
    {
      id: 'furniture',
      name: 'Meubles & Maison',
      icon: '🪑',
      subcategories: ['Meubles', 'Électroménager', 'Décoration', 'Cuisine', 'Jardin']
    },
    {
      id: 'baby-kids',
      name: 'Bébé & Enfants',
      icon: '👶',
      subcategories: ['Vêtements bébé', 'Jouets', 'Poussettes', 'Lit bébé', 'Articles de puériculture']
    },
    {
      id: 'sports',
      name: 'Sports & Loisirs',
      icon: '⚽',
      subcategories: ['Football', 'Fitness', 'Vélos', 'Sports de raquette', 'Équipements']
    },
    {
      id: 'jobs-services',
      name: 'Emploi & Services',
      icon: '💼',
      subcategories: ['Offres d\'emploi', 'Services', 'Cours particuliers', 'Événements']
    },
    {
      id: 'education',
      name: 'Éducation & Cours',
      icon: '🎓',
      subcategories: ['Livres', 'Cours particuliers', 'Formations', 'Fournitures scolaires']
    },
    {
      id: 'pets',
      name: 'Animaux',
      icon: '🐕',
      subcategories: ['Chiens', 'Chats', 'Oiseaux', 'Accessoires', 'Nourriture']
    },
    {
      id: 'other',
      name: 'Autres',
      icon: '📦',
      subcategories: []
    }
  ];

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
});

/**
 * @desc    Obtenir les villes du Togo
 * @route   GET /api/categories/cities
 * @access  Public
 */
router.get('/cities', (req, res) => {
  const cities = [
    { name: 'Lomé', region: 'Maritime' },
    { name: 'Kara', region: 'Kara' },
    { name: 'Sokodé', region: 'Centrale' },
    { name: 'Kpalimé', region: 'Plateaux' },
    { name: 'Atakpamé', region: 'Plateaux' },
    { name: 'Bassar', region: 'Kara' },
    { name: 'Tsévié', region: 'Maritime' },
    { name: 'Aného', region: 'Maritime' },
    { name: 'Dapaong', region: 'Savanes' },
    { name: 'Tchamba', region: 'Centrale' },
    { name: 'Autre', region: 'Autre' }
  ];

  res.status(200).json({
    success: true,
    count: cities.length,
    cities
  });
});

module.exports = router;
