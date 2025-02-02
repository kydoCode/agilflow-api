const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');

// Require routes
const authRoutes = require('./routes/authRoutes');
const userStoriesRoutes = require('./routes/userStoriesRoutes');

const app = express();

// const whitelist = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://www.agilflow.app'];

// const corsOptions = {
//   origin: [...whitelist],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 204,
// };

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable CORS for all OPTIONS requests

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/userstories', userStoriesRoutes);

app.get('/', (req, res) => {
  res.send('Le serveur est en route. version:1.0.0');
});

const port = process.env.PORT || 3000;

sequelize.sync({ force: false, alter: false }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

module.exports = app;
