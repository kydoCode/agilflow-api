# AgilFlow API

API REST pour la gestion d'User Stories en méthodologie Agile. Backend développé avec Node.js, Express et PostgreSQL.

## Prérequis

- Node.js >= 18.x
- PostgreSQL (ou compte Neon)
- npm ou yarn

## Installation

```bash
git clone https://github.com/kydoCode/agilflow-api.git
cd agilflow-api
npm install
```

Créer un fichier `.env` à la racine avec les variables suivantes :

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=3000
```

## Démarrage

```bash
# Lancement de l'API
npm start
```

## Documentation API

La documentation interactive Swagger est disponible sur :
- Développement : http://localhost:3000/api-docs
- Production : https://agilflow-api.vercel.app/api-docs

## Authentification

L'API utilise des tokens JWT avec expiration automatique.

**Inscription**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "developer"
}
```

Rôles disponibles : `developer`, `product_owner`, `scrum_master`

**Connexion**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

La réponse contient le token à utiliser dans les requêtes suivantes :
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "REDACTED FOR SAFETY PURPOSE IN README.MD"
  }
}
```

**Utilisation du token**

Ajouter le header suivant à chaque requête protégée :
```
Authorization: Bearer <votre_token>
```

## Endpoints User Stories

**Lister les user stories**
```bash
GET /api/userstories
```

Paramètres de requête disponibles :
- `page` : numéro de page (défaut: 1)
- `limit` : éléments par page (défaut: 10)
- `status` : filtrer par statut (todo, in_progress, done)
- `priority` : filtrer par priorité (low, medium, high)
- `search` : recherche textuelle dans action et need
- `sortBy` : champ de tri (défaut: createdAt)
- `order` : ordre de tri (asc ou desc)

Exemple :
```bash
GET /api/userstories?page=1&limit=10&status=todo&priority=high&search=interface
```

**Créer une user story**
```bash
POST /api/userstories
Content-Type: application/json

{
  "action": "créer une interface",
  "need": "gérer les user stories",
  "status": "todo",
  "priority": "high"
}
```

**Mettre à jour une user story**
```bash
PUT /api/userstories/:id
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Supprimer une user story**
```bash
DELETE /api/userstories/:id
```

## Sécurité

Le projet intègre plusieurs mécanismes de sécurité :

- Authentification JWT avec expiration automatique
- Rate limiting sur l'authentification et les endpoints
- Helmet.js pour sécuriser les headers HTTP
- Validation des données avec Joi
- CORS configuré selon l'environnement
- SSL/TLS obligatoire en production
- Logging structuré avec Winston

## Structure du projet

```
agilflow-api/
├── config/          Configuration (base de données, logger, swagger)
├── controllers/     Logique métier des endpoints
├── middleware/      Middlewares (authentification, validation, erreurs)
├── models/          Modèles Sequelize (User, UserStories)
├── routes/          Définition des routes Express
├── utils/           Classes d'erreur et helpers de réponse
├── validators/      Schémas de validation Joi
├── logs/            Fichiers de log (non versionnés)
└── app.js           Point d'entrée de l'application
```

## Déploiement sur Vercel

```bash
vercel --prod
```

Variables d'environnement à configurer :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `NODE_ENV` : `production`

## Licence

MIT

---

Développé par **kydoCode**
