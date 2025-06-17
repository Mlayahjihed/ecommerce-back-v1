const sequelize = require('../config/db');

// Import all models
const Categorie = require('./Categorie');
const SousCategorie = require('./SousCategorie');
const Produit = require('./Produit');
const Order = require('./Order');
const OrderProduct = require('./OrderProduct');
const User = require('./user');
const Image = require('./Image');
const Marque = require('./Marque');
const Favorite = require('./Favorite');
const Comment = require('./Comment');
// Ajoutez ces associations
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Produit.hasMany(Comment, { foreignKey: 'productId',onDelete: 'CASCADE' });
Comment.belongsTo(Produit, { foreignKey: 'productId' });
// Setup Associations (Relations)
User.hasMany(Favorite, {
  foreignKey: 'userId',
  onDelete: 'CASCADE' // Supprime les favoris si l'user est supprimé
});
Favorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// PRODUCT FAVORITES RELATIONS
Produit.hasMany(Favorite, {
  foreignKey: 'productId',
  onDelete: 'CASCADE' // Supprime les favoris si le produit est supprimé
});
Favorite.belongsTo(Produit, {
  foreignKey: 'productId',
  as: 'product'
});

// Many-to-Many implicit through Favorite
User.belongsToMany(Produit, {
  through: Favorite,
  foreignKey: 'userId',
  as: 'favoriteProducts'
});
Produit.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'productId',
  as: 'favoritedByUsers'
});
// Categorie -> SousCategorie
Categorie.hasMany(SousCategorie, { foreignKey: "categorieId", onDelete: "CASCADE" });
SousCategorie.belongsTo(Categorie, { foreignKey: "categorieId" });

// Categorie -> Produit
Categorie.hasMany(Produit, { foreignKey: "categorieId", onDelete: "SET NULL" });
Produit.belongsTo(Categorie, { foreignKey: "categorieId" });

// SousCategorie -> Produit
SousCategorie.hasMany(Produit, { foreignKey: "sousCategorieId", onDelete: "SET NULL" });
Produit.belongsTo(SousCategorie, { foreignKey: "sousCategorieId" });

// Marque -> Produit (avec CASCADE)
Marque.hasMany(Produit, { 
  foreignKey: "marqueId", 
  onDelete: "CASCADE" // Ici est le changement important
});
Produit.belongsTo(Marque, { 
  foreignKey: "marqueId",
  as: "marque"
});

// Produit <-> Order (Many to Many through OrderProduct)
Produit.belongsToMany(Order, { through: OrderProduct, foreignKey: "ProductId" });
Order.belongsToMany(Produit, { through: OrderProduct, foreignKey: "OrderId" });

// Produit -> OrderProduct (One to Many)
Produit.hasMany(OrderProduct, { foreignKey: "ProductId" });
OrderProduct.belongsTo(Produit, { foreignKey: "ProductId" });

// Order -> OrderProduct (One to Many)
Order.hasMany(OrderProduct, { foreignKey: "OrderId", as: "orderProducts" });
OrderProduct.belongsTo(Order, { foreignKey: "OrderId" });

// User has many Orders
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Produit has many Images
Produit.hasMany(Image, { foreignKey: 'produitId', onDelete: 'CASCADE' });
Image.belongsTo(Produit, { foreignKey: 'produitId' });

// Export all models
module.exports = {
  sequelize,
  Categorie,
  SousCategorie,
  Produit,
  Order,
  OrderProduct,
  User,
  Image,
  Marque,
  Favorite,
  Comment
};