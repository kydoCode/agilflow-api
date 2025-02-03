const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
      allowNull: true, // Role is optional
   },
   assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
         model: 'Users',
         key: 'id',
      }
   }
})

module.exports = UserStories;