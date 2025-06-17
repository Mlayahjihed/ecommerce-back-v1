const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photo_url: {
    type: DataTypes.STRING,
    defaultValue: "uploads/users/avatar.png",
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "USER",
  },
  reset_token: {
    type: DataTypes.STRING,
  },
  expire_token: {
    type: DataTypes.DATE,
  },
  ban: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
});

module.exports = User;
