const { Sequelize } = require('sequelize');
require('dotenv').config();

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//    host: process.env.DB_HOST,
//    dialect: 'mysql',
//    logging: false,
// });
console.log("DB_URL:", process.env.DB_URL);

if (!process.env.DB_URL) {
  console.error('DB_URL is not defined in environment variables');
  throw new Error('Database URL is missing');
}

try {
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} catch (error) {
  console.error('Erreur lors de la création de Sequelize:', error);
  throw error;
}
module.exports = sequelize;