const { Sequelize } = require('sequelize');
require('dotenv').config();
import pg from 'pg'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  throw new Error('Database URL is missing');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

module.exports = sequelize;