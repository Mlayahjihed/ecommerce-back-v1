const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Produit = require("./Produit");
const OrderProduct = require("./OrderProduct");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'en attente'
  },
  nom: DataTypes.STRING,
  prenom: DataTypes.STRING,
  societe: DataTypes.STRING,
  city: DataTypes.STRING,
  country: DataTypes.STRING,
  rue: DataTypes.STRING,
  codePostal: DataTypes.STRING,
  telephone: DataTypes.STRING,
  total: DataTypes.FLOAT,
  userId: {  
    type: DataTypes.INTEGER,
    allowNull: false
  }
});
module.exports = Order;


