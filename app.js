const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database')

// Require routes
const authRoutes = require('./routes/authRoutes');
const userStoriesRoutes = require('./routes/userStoriesRoutes')

const app = express();

// const corsOptions = {
//    origin: [
//      'https://www.agilflow.app',  // URL de production Vercel
//    //   'http://127.0.0.1:5173',                  // URL de développement local pour Vite
//    //   'http://127.0.0.1:3000'                   // Alternative pour le port 3000
//    ],
//    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//    allowedHeaders: ['Content-Type', 'Authorization'],
//    credentials: true,                          // Permet l'envoi de cookies
//    optionsSuccessStatus: 204                   // Pour la compatibilité avec certains navigateurs
//  };

// app.use(cors(corsOptions));
app.use(cors);

app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes)
app.use('/api/userstories', userStoriesRoutes)


app.get('/', (req, res) => {
   res.send(`Le serveur est en route. version:1.0.0`)
})

const port = process.env.PORT || 3000

sequelize.sync({ force: false, alter: false }).then(() => {
   app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
  })
})

module.exports = app;
