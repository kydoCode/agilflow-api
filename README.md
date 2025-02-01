# Agilflow API Backend

Ce document fournit une vue d'ensemble de l'application backend Agilflow API.

## 1. Configuration du projet et dépendances

Le projet est construit en utilisant :

*   **Express :** Framework web pour Node.js.
*   **Sequelize :** ORM pour interagir avec la base de données.
*   **MySQL2 / PG :** Pilotes de base de données pour MySQL et PostgreSQL.
*   **bcryptjs :** Pour le hashage des mots de passe.
*   **jsonwebtoken :** Pour l'authentification basée sur JWT.
*   **dotenv :** Pour gérer les variables d'environnement.
*   **cors :** Pour la gestion du CORS.
*   **body-parser :** Pour parser les corps de requête.
*   **nodemon :** Pour le redémarrage automatique du serveur en développement.

Ces dépendances sont gérées avec `package.json` et installées en utilisant `npm install`.

## 2. Point d'entrée (`app.js`)

L'application démarre à `app.js`, qui configure le serveur Express, connecte la base de données, configure les middlewares et définit les routes.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userStoriesRoutes = require('./routes/userStoriesRoutes');
const db = require('./config/database'); 

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/user-stories', userStoriesRoutes);

// Synchronisation de la base de données et démarrage du serveur
db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(\`ServeurBackend en écoute sur le port ${process.env.PORT || 3000}\`);
  });
});
```

## 3. Configuration de la base de données (`config/database.js`)

Ce fichier configure la connexion à la base de données en utilisant Sequelize. Il utilise les variables d'environnement pour la configuration et exporte l'instance Sequelize et les modèles.

```javascript
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT, 
  port: process.env.DB_PORT,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Définition des modèles
db.User = require('../models/User')(sequelize, Sequelize);
db.UserStories = require('../models/UserStories')(sequelize, Sequelize);

module.exports = db;
```

## 4. Modèles (`models/`)

Le dossier `models` contient les définitions des modèles Sequelize pour l'application :

*   `User.js` : Modèle pour les utilisateurs.
*   `UserStories.js` : Modèle pour les user stories.
*   `index.js` : Fichier d'index pour associer les modèles (si nécessaire).

## 5. Contrôleurs (`controllers/`)

Le dossier `controllers` contient la logique de contrôle pour gérer les requêtes HTTP :

*   `authController.js` : Contrôleur pour la gestion de l'authentification (inscription, connexion).
*   `userStoriesController.js` : Contrôleur pour la gestion des user stories (CRUD).

## 6. Routes (`routes/`)

Le dossier `routes` définit les routes de l'API et les associe aux contrôleurs :

*   `authRoutes.js` : Routes pour l'authentification (`/auth`).
*   `userStoriesRoutes.js` : Routes pour les user stories (`/user-stories`).

## 7. Middlewares (`middleware/`)

Le dossier `middleware` contient les middlewares personnalisés :

*   `auth.js` : Middleware d'authentification pour protéger les routes.

## Arborescence du projet

```
agilflow-api/
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
├── vercel.json
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   └── userStoriesController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── index.js
│   ├── User.js
│   └── UserStories.js
└── routes/
    ├── authRoutes.js
    └── userStoriesRoutes.js
└── README.md
```

## Structure du projet

## Conclusion

Ce backend API fournit une API RESTful pour la gestion des utilisateurs et des user stories, en utilisant Express, Sequelize et une base de données MySQL ou PostgreSQL. 
Ce fichier README.md a été créé pour refléter l'état actuel du projet et son arborescence.

v2025-02-01
