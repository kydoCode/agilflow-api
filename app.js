import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sequelize from './config/database.js';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userStoriesRoutes from './routes/userStoriesRoutes.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration CORS sécurisée
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://www.agilflow.app', 'https://agilflow.app']
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/userstories', userStoriesRoutes);

app.get('/', (req, res) => {
  res.send('Le serveur est en route. version:1.0.0');
});

// Middleware de gestion des erreurs globale
app.use((err, req, res, next) => {
  // Logger l'erreur avec contexte
  console.error('Erreur serveur:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Réponse selon l'environnement
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ 
      success: false,
      message: 'Erreur interne du serveur' 
    });
  } else {
    res.status(err.status || 500).json({ 
      success: false,
      message: err.message, 
      stack: err.stack 
    });
  }
});


const port = process.env.PORT || 3000;

sequelize.sync({ force: false, alter: false }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

export default app;
