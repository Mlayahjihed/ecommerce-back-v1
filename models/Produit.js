const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const Produit = sequelize.define("Produit", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  newprice: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }, archive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
  },
});


module.exports = Produit;
