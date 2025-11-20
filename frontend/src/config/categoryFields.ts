/**
 * Configuration des champs spécifiques par catégorie
 * Permet d'afficher des formulaires adaptés selon le type d'annonce
 */

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface CategoryConfig {
  specificFields: FieldConfig[];
  hideFields?: string[]; // Champs communs à masquer
}

export const CATEGORY_FIELDS: Record<string, CategoryConfig> = {
  'phones-tablets': {
    specificFields: [
      {
        name: 'brand',
        label: 'Marque',
        type: 'select',
        options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Realme', 'Tecno', 'Infinix', 'Autre'],
        required: true
      },
      {
        name: 'model',
        label: 'Modèle',
        type: 'text',
        placeholder: 'Ex: iPhone 15 Pro',
        required: true
      },
      {
        name: 'storage',
        label: 'Stockage',
        type: 'select',
        options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
        required: false
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        placeholder: 'Ex: Noir, Blanc, Bleu'
      },
      {
        name: 'warranty',
        label: 'Garantie',
        type: 'select',
        options: ['Oui - En cours', 'Oui - Expirée', 'Non']
      }
    ]
  },

  'motorcycles': {
    specificFields: [
      {
        name: 'brand',
        label: 'Marque',
        type: 'select',
        options: ['Yamaha', 'Honda', 'Suzuki', 'TVS', 'Bajaj', 'Dayun', 'Apsonic', 'Autre'],
        required: true
      },
      {
        name: 'year',
        label: 'Année',
        type: 'number',
        placeholder: '2024',
        required: true
      },
      {
        name: 'mileage',
        label: 'Kilométrage',
        type: 'number',
        placeholder: '5000'
      },
      {
        name: 'engineSize',
        label: 'Cylindrée',
        type: 'select',
        options: ['50cc', '100cc', '125cc', '150cc', '200cc', '250cc', '400cc+']
      },
      {
        name: 'hasDocuments',
        label: 'Papiers à jour (carte grise, assurance)',
        type: 'checkbox'
      }
    ]
  },

  'cars': {
    specificFields: [
      {
        name: 'brand',
        label: 'Marque',
        type: 'select',
        options: ['Toyota', 'Honda', 'Nissan', 'Mercedes', 'BMW', 'Audi', 'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Autre'],
        required: true
      },
      {
        name: 'model',
        label: 'Modèle',
        type: 'text',
        placeholder: 'Ex: Corolla',
        required: true
      },
      {
        name: 'year',
        label: 'Année',
        type: 'number',
        placeholder: '2020',
        required: true
      },
      {
        name: 'mileage',
        label: 'Kilométrage',
        type: 'number',
        placeholder: '50000'
      },
      {
        name: 'fuelType',
        label: 'Carburant',
        type: 'select',
        options: ['Essence', 'Diesel', 'Hybride', 'Électrique']
      },
      {
        name: 'transmission',
        label: 'Transmission',
        type: 'select',
        options: ['Manuelle', 'Automatique']
      },
      {
        name: 'hasDocuments',
        label: 'Papiers à jour',
        type: 'checkbox'
      }
    ]
  },

  'real-estate': {
    specificFields: [
      {
        name: 'propertyType',
        label: 'Type de bien',
        type: 'select',
        options: ['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain', 'Bureau', 'Magasin'],
        required: true
      },
      {
        name: 'rooms',
        label: 'Nombre de chambres',
        type: 'number',
        placeholder: '2'
      },
      {
        name: 'bathrooms',
        label: 'Salles de bain',
        type: 'number',
        placeholder: '1'
      },
      {
        name: 'surface',
        label: 'Surface (m²)',
        type: 'number',
        placeholder: '80',
        required: true
      },
      {
        name: 'furnished',
        label: 'Meublé',
        type: 'checkbox'
      },
      {
        name: 'forRent',
        label: 'À louer (sinon à vendre)',
        type: 'checkbox'
      }
    ],
    hideFields: ['condition'] // Pas d'état pour l'immobilier
  },

  'fashion': {
    specificFields: [
      {
        name: 'category',
        label: 'Catégorie',
        type: 'select',
        options: ['Vêtements homme', 'Vêtements femme', 'Vêtements enfant', 'Chaussures', 'Sacs', 'Accessoires']
      },
      {
        name: 'size',
        label: 'Taille',
        type: 'text',
        placeholder: 'Ex: M, L, 42'
      },
      {
        name: 'brand',
        label: 'Marque',
        type: 'text',
        placeholder: 'Ex: Nike, Adidas, Zara'
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        placeholder: 'Ex: Noir, Rouge'
      }
    ]
  },

  'jobs-services': {
    specificFields: [
      {
        name: 'jobType',
        label: 'Type',
        type: 'select',
        options: ['CDI', 'CDD', 'Stage', 'Freelance', 'Service', 'Autre'],
        required: true
      },
      {
        name: 'experience',
        label: 'Expérience requise',
        type: 'select',
        options: ['Débutant accepté', '1-3 ans', '3-5 ans', '5+ ans']
      },
      {
        name: 'education',
        label: 'Niveau d\'études',
        type: 'select',
        options: ['Aucun', 'BAC', 'BAC+2', 'BAC+3', 'BAC+5+']
      },
      {
        name: 'salary',
        label: 'Salaire (FCFA/mois)',
        type: 'number',
        placeholder: '50000'
      },
      {
        name: 'startDate',
        label: 'Date de début',
        type: 'date'
      }
    ],
    hideFields: ['price', 'condition', 'isNegotiable'] // Pas de prix ni d'état
  },

  'education': {
    specificFields: [
      {
        name: 'courseType',
        label: 'Type de cours',
        type: 'select',
        options: [
          'Soutien scolaire',
          'Langues (Anglais, Français)',
          'Informatique',
          'Musique',
          'Sport',
          'Art',
          'Autre'
        ],
        required: true
      },
      {
        name: 'level',
        label: 'Niveau',
        type: 'select',
        options: ['Primaire', 'Collège', 'Lycée', 'Université', 'Professionnel', 'Tous niveaux']
      },
      {
        name: 'duration',
        label: 'Durée du cours',
        type: 'text',
        placeholder: 'Ex: 2 mois, 10 séances'
      },
      {
        name: 'schedule',
        label: 'Horaires',
        type: 'text',
        placeholder: 'Ex: Lun-Mer-Ven 17h-19h'
      },
      {
        name: 'location',
        label: 'Lieu',
        type: 'select',
        options: ['À domicile', 'En ligne', 'Dans un local', 'Les deux']
      }
    ],
    hideFields: ['condition', 'isNegotiable'] // Pas d'état
  },

  'pets': {
    specificFields: [
      {
        name: 'animalType',
        label: 'Type d\'animal',
        type: 'select',
        options: ['Chien', 'Chat', 'Oiseau', 'Poisson', 'Reptile', 'Rongeur', 'Autre'],
        required: true
      },
      {
        name: 'breed',
        label: 'Race',
        type: 'text',
        placeholder: 'Ex: Berger Allemand, Persan'
      },
      {
        name: 'age',
        label: 'Âge',
        type: 'text',
        placeholder: 'Ex: 6 mois, 2 ans'
      },
      {
        name: 'vaccinated',
        label: 'Vacciné',
        type: 'checkbox'
      },
      {
        name: 'gender',
        label: 'Sexe',
        type: 'select',
        options: ['Mâle', 'Femelle']
      }
    ],
    hideFields: ['condition'] // Pas d'état pour les animaux
  },

  'electronics': {
    specificFields: [
      {
        name: 'category',
        label: 'Catégorie',
        type: 'select',
        options: ['TV & Audio', 'Ordinateurs', 'Appareils photo', 'Consoles de jeux', 'Électroménager', 'Autre']
      },
      {
        name: 'brand',
        label: 'Marque',
        type: 'text',
        placeholder: 'Ex: Samsung, LG, Sony'
      },
      {
        name: 'model',
        label: 'Modèle',
        type: 'text',
        placeholder: 'Ex: PlayStation 5'
      },
      {
        name: 'warranty',
        label: 'Garantie',
        type: 'select',
        options: ['Oui - En cours', 'Oui - Expirée', 'Non']
      }
    ]
  },

  'furniture': {
    specificFields: [
      {
        name: 'category',
        label: 'Catégorie',
        type: 'select',
        options: ['Salon', 'Chambre', 'Cuisine', 'Bureau', 'Extérieur', 'Autre']
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'text',
        placeholder: 'Ex: Bois, Métal, Tissu'
      },
      {
        name: 'dimensions',
        label: 'Dimensions (LxPxH en cm)',
        type: 'text',
        placeholder: 'Ex: 120x80x75'
      }
    ]
  },

  'baby-kids': {
    specificFields: [
      {
        name: 'category',
        label: 'Catégorie',
        type: 'select',
        options: ['Vêtements', 'Jouets', 'Poussettes & Sièges', 'Meubles', 'Équipement', 'Autre']
      },
      {
        name: 'age',
        label: 'Âge',
        type: 'select',
        options: ['0-6 mois', '6-12 mois', '1-2 ans', '2-4 ans', '4-8 ans', '8+ ans']
      },
      {
        name: 'gender',
        label: 'Genre',
        type: 'select',
        options: ['Garçon', 'Fille', 'Mixte']
      }
    ]
  },

  'sports': {
    specificFields: [
      {
        name: 'sport',
        label: 'Sport',
        type: 'select',
        options: ['Football', 'Basketball', 'Tennis', 'Fitness', 'Vélo', 'Running', 'Natation', 'Autre']
      },
      {
        name: 'category',
        label: 'Catégorie',
        type: 'select',
        options: ['Équipement', 'Vêtements', 'Chaussures', 'Accessoires']
      },
      {
        name: 'brand',
        label: 'Marque',
        type: 'text',
        placeholder: 'Ex: Nike, Adidas, Decathlon'
      },
      {
        name: 'size',
        label: 'Taille',
        type: 'text',
        placeholder: 'Ex: M, L, 42'
      }
    ]
  },

  'other': {
    specificFields: [],
    hideFields: [] // Utilise tous les champs par défaut
  }
};

/**
 * Vérifie si un champ doit être masqué pour une catégorie donnée
 */
export const shouldHideField = (category: string, fieldName: string): boolean => {
  const config = CATEGORY_FIELDS[category];
  return config?.hideFields?.includes(fieldName) || false;
};

/**
 * Récupère les champs spécifiques d'une catégorie
 */
export const getCategoryFields = (category: string): FieldConfig[] => {
  return CATEGORY_FIELDS[category]?.specificFields || [];
};
