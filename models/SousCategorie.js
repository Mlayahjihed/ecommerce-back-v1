const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const SousCategorie = sequelize.define("SousCategorie", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


module.exports = SousCategorie;
