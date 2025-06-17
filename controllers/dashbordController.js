const { Op, fn, col } = require("sequelize");
const { User, Order, Produit, OrderProduct } = require("../models");
const moment = require("moment");

exports.getStats = async (req, res) => {
  try {
    // 1. Nombre d'utilisateurs avec rôle USER
    const nbUsers = await User.count({ where: { role: 'USER' } });

    // 2. Nombre d'utilisateurs ayant commandé
    const utilisateursAyantCommande = await Order.findAll({
      attributes: [[fn('DISTINCT', col('userId')), 'userId']],
    });
    const nbUtilisateursAyantCommande = utilisateursAyantCommande.length;

    // 3. Nombre total de commandes
    const nbCommandes = await Order.count();



    // 5. Histogramme : nombre total commandé par produit
    const produitsQuantites = await OrderProduct.findAll({
      attributes: ['ProductId', [fn('SUM', col('quantity')), 'totalQuantite']],

      group: ['ProductId'],
      include: [
        {
          model: Produit,
          attributes: ['title'],
        },
        {
          model: Order,
          where: {
            status: 'accepté',
          },
        },
      ],
    });

    res.json({
      nbUsers,
      nbUtilisateursAyantCommande,
      nbCommandes,
      histogramme: produitsQuantites.map((p) => ({
        produit: p.Produit.title,
        quantite: p.dataValues.totalQuantite,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};