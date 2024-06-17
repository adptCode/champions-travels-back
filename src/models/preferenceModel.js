import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import User from './userModel.js';

const Preference = sequelize.define('Preference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  timestamps: false,
});

User.hasMany(Preference, { foreignKey: 'user_id' });
Preference.belongsTo(User, { foreignKey: 'user_id' });

export default Preference;