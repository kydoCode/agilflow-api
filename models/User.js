import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
   email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
         isEmail: true
      }
   },
   name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
         len: [2, 100]
      }
   },
   password: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   role: {
      type: DataTypes.ENUM('developer', 'product owner', 'tester', 'teammate', 'scrum master', 'administrator'),
      allowNull: false,
   },
   resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
   },
   resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
   }
});

export default User;