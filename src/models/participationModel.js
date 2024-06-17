import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import User from './userModel.js';
import Event from './eventModel.js';

const EventParticipation = sequelize.define('EventParticipation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  registration_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

User.hasMany(EventParticipation, { foreignKey: 'user_id' });
EventParticipation.belongsTo(User, { foreignKey: 'user_id' });

Event.hasMany(EventParticipation, { foreignKey: 'event_id' });
EventParticipation.belongsTo(Event, { foreignKey: 'event_id' });

export default EventParticipation;