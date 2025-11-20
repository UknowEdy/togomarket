# API Admin TogoMarket

Documentation complète de l'API d'administration de TogoMarket.

## Authentification

Toutes les routes admin nécessitent:
1. Un token JWT valide dans le header `Authorization: Bearer <token>`
2. Un rôle `staff` ou `admin`

```bash
# Exemple de requête
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Comptes Staff

### Comptes par défaut

| Email | Rôle | Usage |
|-------|------|-------|
| edemkukuz+admin@gmail.com | admin | Administration complète |
| edemkukuz+client@gmail.com | staff | Support client |
| edemkukuz+noreply@gmail.com | staff | Emails automatiques |
| edemkukuz+test@gmail.com | user | Tests |

### Créer les comptes staff

```bash
cd backend
node src/scripts/seedStaff.js
```

## Routes API

### Dashboard

#### GET /api/admin/dashboard/stats
Statistiques globales de la plateforme.

**Permissions:** staff, admin

**Réponse:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 1543,
      "active": 1421,
      "banned": 12,
      "new30Days": 156
    },
    "listings": {
      "total": 5678,
      "active": 4532,
      "pending": 234,
      "new30Days": 567
    },
    "reviews": {
      "total": 2341
    }
  }
}
```

---

### Gestion des Utilisateurs

#### GET /api/admin/users
Liste tous les utilisateurs avec filtres.

**Permissions:** staff, admin

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (user | staff | admin)
- `city` (Lomé, Kara, etc.)
- `isVerified` (true | false)
- `isBanned` (true | false)
- `search` (nom, téléphone, email)

**Exemple:**
```bash
GET /api/admin/users?page=1&limit=20&city=Lomé&isVerified=true
```

**Réponse:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

#### GET /api/admin/users/:id
Obtenir un utilisateur spécifique avec ses annonces.

**Permissions:** staff, admin

**Réponse:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "role": "user",
    ...
  },
  "listings": [...]
}
```

---

#### PUT /api/admin/users/:id/ban
Bannir ou débannir un utilisateur.

**Permissions:** staff, admin

**Body:**
```json
{
  "banReason": "Violation des conditions d'utilisation"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Utilisateur banni",
  "user": {...}
}
```

**Notes:**
- Impossible de bannir un admin
- Toggle: si déjà banni, il sera débanni

---

#### PUT /api/admin/users/:id/verify-identity
Approuver ou rejeter le document d'identité.

**Permissions:** staff, admin

**Body:**
```json
{
  "status": "approved"  // ou "rejected"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Document approuvé",
  "user": {...}
}
```

**Notes:**
- Ajoute automatiquement le badge "verified" si approuvé
- L'utilisateur doit avoir soumis un document

---

#### PUT /api/admin/users/:id/role
Changer le rôle d'un utilisateur.

**Permissions:** admin uniquement

**Body:**
```json
{
  "role": "staff"  // user, staff, ou admin
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Rôle mis à jour vers staff",
  "user": {...}
}
```

**Notes:**
- Seul un admin peut créer un autre admin
- Staff peut promouvoir user → staff
- Admin peut tout faire

---

### Gestion des Annonces

#### GET /api/admin/listings
Liste toutes les annonces avec filtres.

**Permissions:** staff, admin

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (pending | active | sold | expired | rejected)
- `category` (ID de catégorie)
- `city` (Lomé, Kara, etc.)
- `search` (titre, description)

**Exemple:**
```bash
GET /api/admin/listings?status=pending&page=1
```

**Réponse:**
```json
{
  "success": true,
  "listings": [
    {
      "_id": "...",
      "title": "...",
      "status": "pending",
      "seller": {
        "fullName": "...",
        "phone": "..."
      },
      "category": {
        "name": "Téléphones",
        "icon": "📱"
      }
    }
  ],
  "pagination": {...}
}
```

---

#### PUT /api/admin/listings/:id/moderate
Approuver ou rejeter une annonce.

**Permissions:** staff, admin

**Body:**
```json
{
  "status": "active",  // ou "rejected"
  "rejectionReason": "Photos non conformes"  // si rejected
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Annonce approuvée",
  "listing": {...}
}
```

---

#### DELETE /api/admin/listings/:id
Supprimer une annonce.

**Permissions:** staff, admin

**Réponse:**
```json
{
  "success": true,
  "message": "Annonce supprimée"
}
```

---

### Gestion des Avis

#### GET /api/admin/reviews/reported
Liste tous les avis signalés.

**Permissions:** staff, admin

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)

**Réponse:**
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "...",
      "rating": 1,
      "comment": "...",
      "isReported": true,
      "reviewer": {
        "fullName": "...",
        "avatar": {...}
      },
      "reviewee": {
        "fullName": "...",
        "avatar": {...}
      }
    }
  ],
  "pagination": {...}
}
```

---

#### DELETE /api/admin/reviews/:id
Supprimer un avis.

**Permissions:** staff, admin

**Réponse:**
```json
{
  "success": true,
  "message": "Avis supprimé"
}
```

**Notes:**
- Recalcule automatiquement la note moyenne de l'utilisateur

---

## Permissions

### Différences entre Staff et Admin

| Action | Staff | Admin |
|--------|-------|-------|
| Voir dashboard | ✅ | ✅ |
| Gérer utilisateurs | ✅ | ✅ |
| Bannir utilisateurs | ✅ | ✅ |
| Vérifier identités | ✅ | ✅ |
| **Changer rôles** | ❌ | ✅ |
| **Créer admins** | ❌ | ✅ |
| Modérer annonces | ✅ | ✅ |
| Supprimer annonces | ✅ | ✅ |
| Gérer avis | ✅ | ✅ |

### Restrictions de sécurité

1. **Impossible de bannir un admin**
2. **Seul un admin peut promouvoir quelqu'un admin**
3. **Les comptes bannis ne peuvent pas se connecter**
4. **Les tokens expirés sont automatiquement rejetés**

---

## Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource introuvable |
| 500 | Internal Server Error | Erreur serveur |

---

## Exemples d'utilisation

### Workflow de modération d'annonce

```bash
# 1. Récupérer les annonces en attente
GET /api/admin/listings?status=pending

# 2. Approuver une annonce
PUT /api/admin/listings/64abc123.../moderate
{
  "status": "active"
}

# 3. Ou rejeter avec raison
PUT /api/admin/listings/64abc123.../moderate
{
  "status": "rejected",
  "rejectionReason": "Photos de mauvaise qualité"
}
```

### Workflow de vérification d'identité

```bash
# 1. Lister les utilisateurs avec documents en attente
GET /api/admin/users?search=...

# 2. Voir le document d'un utilisateur
GET /api/admin/users/64abc123...

# 3. Approuver le document
PUT /api/admin/users/64abc123.../verify-identity
{
  "status": "approved"
}
```

### Créer un nouveau staff

```bash
# Seul un admin peut faire cela
PUT /api/admin/users/64abc123.../role
{
  "role": "staff"
}
```

---

## Tests

Pour tester l'API admin:

1. **Créer les comptes staff:**
```bash
node src/scripts/seedStaff.js
```

2. **Se connecter avec le compte admin:**
```bash
POST /api/auth/login
{
  "phone": "+22890000001",
  "password": "Admin@2024!"
}
```

3. **Utiliser le token retourné:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/dashboard/stats
```

---

## Sécurité en production

### Bonnes pratiques

1. **Changer tous les mots de passe par défaut**
2. **Utiliser des tokens JWT avec expiration courte pour les admins**
3. **Activer HTTPS en production**
4. **Logger toutes les actions admin**
5. **Activer l'authentification à deux facteurs pour les admins**
6. **Limiter les tentatives de connexion**
7. **Surveiller les actions suspectes**

### Variables d'environnement en production

```env
ADMIN_PASSWORD=<mot_de_passe_fort_unique>
STAFF_PASSWORD=<mot_de_passe_fort_unique>
JWT_SECRET=<clé_secrète_longue_et_aléatoire>
JWT_EXPIRE=1d  # Plus court pour les admins
```

---

## Support

Pour toute question concernant l'API admin:
- Documentation complète: `/backend/docs/`
- Support: edemkukuz+client@gmail.com
