const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Marque = sequelize.define("Marque", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  logo: {
    type: DataTypes.STRING, // Chemin vers l'image du logo
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Marque;