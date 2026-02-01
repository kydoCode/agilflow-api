import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import sequelize from './config/database.js';
import logger from './config/logger.js';
import errorHandler from './middleware/errorHandler.js';
import swaggerSpec from './config/swagger.js';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userStoriesRoutes from './routes/userStoriesRoutes.js';

dotenv.config();

const app = express();

// Helmet pour la sécurité des headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// Configuration CORS sécurisée
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://www.agilflow.app', 'https://agilflow.app']
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting global (100 req/15min en dev, 30 en prod)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 100,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard' }
});

// Rate limiting auth (5 tentatives/15min - protection anti-dictionnaire)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes' }
});

app.use(globalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/userstories', userStoriesRoutes);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Le serveur est en route. version:1.0.0');
});

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);


const port = process.env.PORT || 3000;

sequelize.sync({ force: false, alter: false }).then(() => {
  logger.info(`Server is running on port ${port}`);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

export default app;
