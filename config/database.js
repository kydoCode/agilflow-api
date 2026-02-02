import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL n\'est pas définie dans les variables d\'environnement');
  throw new Error('URL de base de données manquante');
}

// Configuration SSL sécurisée selon l'environnement
const dialectOptions = process.env.NODE_ENV === 'production' 
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: true, // Sécurisé en production
        ca: process.env.DB_SSL_CA // Certificat CA si disponible
      }
    }
  : {
      ssl: {
        require: true,
        rejectUnauthorized: false // Permissif en développement
      }
    };

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });

export default sequelize;