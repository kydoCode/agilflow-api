import sequelize from './config/database.js';
import './models/index.js';

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

syncDatabase();
