
const {  Categorie, SousCategorie } = require("../models");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Categorie.findAll({
      include: [{ model: SousCategorie, attributes: ["id", "name"] }],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.getSousCategoriesByCategorie = async (req, res) => {
  try {
    const { categorieId } = req.query;

    if (!categorieId) {
      return res.status(400).json({ message: "categorieId est requis" });
    }

    const sousCategories = await SousCategorie.findAll({
      where: { categorieId },
      attributes: ["id", "name"],
    });

    if (!sousCategories.length) {
      return res.status(404).json({ message: "Aucune sous-catégorie trouvée pour cette catégorie." });
    }

    res.json(sousCategories);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
