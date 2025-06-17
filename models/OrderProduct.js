
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderProduct = sequelize.define("OrderProduct", {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
   priceproduct: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  OrderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ProductId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['OrderId', 'ProductId']
    }
  ]
});

// Make sure to export the initialized model
module.exports = OrderProduct;