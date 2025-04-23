// models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  deviceInfo: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isFraudulent: {
    type: DataTypes.BOOLEAN,
  },
  fraudScore: {
    type: DataTypes.FLOAT,
  },
});

module.exports = Transaction;
