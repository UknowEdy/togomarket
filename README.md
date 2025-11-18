# 🇹🇬 TogoMarket - Plateforme de Petites Annonces pour l'Afrique

> Marketplace moderne inspirée de Subito.it, adaptée aux réalités du Togo et de l'Afrique de l'Ouest

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

---

## 📋 Table des Matières

- [Aperçu du Projet](#-aperçu-du-projet)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Structure du Projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)

---

## 🎯 Aperçu du Projet

TogoMarket est une plateforme de petites annonces moderne conçue spécifiquement pour le marché africain, avec un focus sur le Togo. Elle permet aux utilisateurs d'acheter et vendre facilement :

- 📱 Téléphones & Tablettes
- 🏍️ Motos & Scooters
- 🚗 Voitures
- 🏠 Immobilier
- 👔 Mode & Vêtements
- Et bien plus encore !

### Spécificités Africaines

- **Mobile Money** : Intégration Togocel, Moov, MTN, Orange Money
- **Optimisation 2G/3G** : Conçu pour connexions lentes
- **Vérification d'identité** : Système de confiance renforcé
- **Multilingue** : Français, Ewe, Kabyè (à venir)
- **Mobile First** : Interface optimisée pour smartphones

---

## ✨ Fonctionnalités

### Phase 1 (Actuelle)

- ✅ Inscription/Connexion avec vérification SMS
- ✅ Publication d'annonces avec photos
- ✅ Recherche et filtres avancés
- ✅ Système de catégories
- ✅ Profils utilisateurs
- ✅ Badges de vérification
- ✅ Géolocalisation par villes/quartiers
- ✅ Design responsive et PWA-ready

### Phase 2 (À venir)

- 🔜 Système de chat en temps réel
- 🔜 Négociation de prix intégrée
- 🔜 Paiement Mobile Money
- 🔜 Notifications push
- 🔜 Favoris et alertes
- 🔜 Système d'évaluation
- 🔜 Boutiques professionnelles
- 🔜 Livraison avec coursiers locaux

---

## 🛠 Technologies

### Backend

- **Node.js** v18+ avec Express
- **MongoDB** pour la base de données
- **JWT** pour l'authentification
- **Cloudinary** pour l'upload d'images
- **Multer** pour la gestion des fichiers
- **Bcrypt** pour le hashage des mots de passe
- **Socket.io** (prévu pour le chat)

### Frontend

- **React** 18 avec TypeScript
- **Vite** pour le build ultra-rapide
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **React Router** v6 pour le routing
- **React Hook Form** pour les formulaires
- **Axios** pour les requêtes HTTP
- **Lucide React** pour les icônes
- **date-fns** pour les dates

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** v18 ou supérieur
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)
- **Git**

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/UknowEdy/mon-projet-web-edy.git
cd mon-projet-web-edy
```

### 2. Installer les dépendances

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend

1. Copier le fichier d'exemple :

```bash
cd backend
cp .env.example .env
```

2. Modifier `.env` avec vos configurations :

```env
# Serveur
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/togomarket
# Ou MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/togomarket

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_123
JWT_EXPIRE=30d

# Cloudinary (créer un compte sur cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS (optionnel - Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+22812345678

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend

1. Copier le fichier d'exemple :

```bash
cd frontend
cp .env.example .env
```

2. Modifier `.env` :

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎬 Lancement

### Option 1 : Lancement séparé (Développement)

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Le serveur API démarre sur `http://localhost:5000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

L'application démarre sur `http://localhost:3000`

### Option 2 : MongoDB local

Si vous utilisez MongoDB en local :

```bash
# Sur macOS/Linux
mongod --dbpath /path/to/your/data

# Sur Windows
mongod --dbpath C:\data\db
```

---

## 📁 Structure du Projet

```
mon-projet-web-edy/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration (DB, Cloudinary)
│   │   ├── controllers/      # Logique métier
│   │   ├── middleware/       # Auth, upload, erreurs
│   │   ├── models/           # Schémas MongoDB
│   │   ├── routes/           # Routes API
│   │   ├── utils/            # Helpers
│   │   └── server.js         # Point d'entrée
│   ├── uploads/              # Fichiers uploadés (local)
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages de l'app
│   │   ├── services/         # API calls
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helpers
│   │   ├── App.tsx           # Composant principal
│   │   ├── main.tsx          # Point d'entrée
│   │   └── index.css         # Styles globaux
│   ├── public/               # Assets statiques
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 📡 API Documentation

### Endpoints principaux

#### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/verify-phone` | Vérification SMS |
| GET | `/api/auth/me` | Profil utilisateur |
| PUT | `/api/auth/update-profile` | Mise à jour profil |

#### Annonces

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/listings` | Liste des annonces |
| GET | `/api/listings/:id` | Détail d'une annonce |
| POST | `/api/listings` | Créer une annonce (🔒) |
| PUT | `/api/listings/:id` | Modifier une annonce (🔒) |
| DELETE | `/api/listings/:id` | Supprimer une annonce (🔒) |
| GET | `/api/listings/my/all` | Mes annonces (🔒) |

#### Catégories

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/categories` | Liste des catégories |
| GET | `/api/categories/cities` | Liste des villes |

🔒 = Authentification requise

### Exemple de requête (cURL)

```bash
# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jean Dupont",
    "phone": "+22890123456",
    "password": "motdepasse123",
    "city": "Lomé"
  }'

# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneOrEmail": "+22890123456",
    "password": "motdepasse123"
  }'

# Liste des annonces
curl http://localhost:5000/api/listings?city=Lomé&category=phones-tablets
```

---

## 🗺 Roadmap

### Q1 2025

- [x] Architecture backend complète
- [x] Interface utilisateur responsive
- [x] Système d'authentification
- [x] Publication d'annonces
- [ ] Chat en temps réel
- [ ] Paiement Mobile Money

### Q2 2025

- [ ] Application mobile (React Native)
- [ ] Dashboard admin complet
- [ ] Notifications push
- [ ] Système de livraison

### Q3 2025

- [ ] Expansion dans d'autres pays (Bénin, Burkina Faso)
- [ ] Support multilingue complet
- [ ] API publique pour partenaires
- [ ] Programme d'affiliation

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteur

**UknowEdy** - Conducteur Poids Lourd & Développeur Web

- GitHub: [@UknowEdy](https://github.com/UknowEdy)

---

## 🙏 Remerciements

- Inspiré par [Subito.it](https://www.subito.it)
- Icônes par [Lucide](https://lucide.dev)
- Conçu avec ❤️ pour l'Afrique 🇹🇬

---

## 📞 Support

Pour toute question ou problème :

- 📧 Email: contact@togomarket.tg
- 💬 Discord: [Rejoindre le serveur](https://discord.gg/togomarket)
- 🐛 Issues: [GitHub Issues](https://github.com/UknowEdy/mon-projet-web-edy/issues)

---

**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub !**
