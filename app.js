const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database')

// Require routes
const authRoutes = require('./routes/authRoutes');
const userStoriesRoutes = require('./routes/userStoriesRoutes')

const app = express();

app.use(cors())

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

