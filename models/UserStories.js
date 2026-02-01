import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserStories = sequelize.define('UserStories', {
   action: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   need: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   status: {
      type: DataTypes.ENUM('todo', 'doing', 'done'),
      allowNull: false,
      defaultValue: 'todo',
   },
   priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'low',
   }, 
   role: {
      type: DataTypes.STRING,
      allowNull: true,
   },
   assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
         model: 'Users',
         key: 'id',
      }
   }
});

export default UserStories;