const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Produit = require("./Produit");

const Image = sequelize.define("Image", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});



module.exports = Image;
