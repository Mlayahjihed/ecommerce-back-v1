const { Favorite, Produit, Marque, Image, Categorie, SousCategorie } = require('../models');

exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Vérifier si le produit existe
    const product = await Produit.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Vérifier si le favori existe déjà
    const existingFavorite = await Favorite.findOne({
      where: { userId, productId }
    });

    if (existingFavorite) {
      // Supprimer le favori
      await existingFavorite.destroy();
      return res.status(200).json({ isFavorite: false });
    } else {
      // Créer un nouveau favori
      const newFavorite = await Favorite.create({ userId, productId });
      return res.status(201).json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Produit,
          as: 'product',
          include: [
            {
              model: Marque,
              as: 'marque',
              attributes: ['id', 'name', 'logo']
            },
            {
              model: Image,
              attributes: ['id', 'url']
            },
            {
              model: Categorie,
              attributes: ['id', 'name']
            },
            {
              model: SousCategorie,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
exports.checkFavorite = async (req, res) => {
  try {
    const { productId } = req.query;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { userId, productId }
    });

    res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// Supprimer un favori
exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const deleted = await Favorite.destroy({
      where: { userId, productId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }

    res.status(200).json({ message: 'Favori supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}