const { Produit, Categorie, SousCategorie, Image, Marque } = require("../models");

const ValidateProduit = require("../validation/Produit");
const { Op } = require("sequelize");

exports.addProduit = async (req, res) => {
  const { errors, isValid } = ValidateProduit(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
      if (!req.files || req.files.length === 0) {
        return res.status(404).json({ images: "Vous devez télécharger au moins une image" });
      }

      if (req.files.length > 5) {
        return res.status(404).json({ images: "Vous ne pouvez télécharger que 5 images maximum" });
      }
      let { title, stock, price, description, categorieId, sousCategorieId, nameCategorie, nameSousCategorie, marqueId, newprice } = req.body;
      if (!categorieId && nameCategorie) {
        // Créer une nouvelle catégorie
        const [newCategory] = await Categorie.findOrCreate({ where: { name: nameCategorie } });
        categorieId = newCategory.id;
      }
      // Gestion de la sous-catégorie
      if (!sousCategorieId && nameSousCategorie) {
        // Vérifier si la sous-catégorie existe déjà dans cette catégorie
        const [newSousCategorie] = await SousCategorie.findOrCreate({
          where: { name: nameSousCategorie, categorieId: categorieId },
        });
        sousCategorieId = newSousCategorie.id;
      }
      // Création du produit
      const produit = await Produit.create({
        title,
        stock,
        price,
        description,
        marqueId,
        newprice,
        categorieId,
        sousCategorieId,
      });
      // Sauvegarder les images si présentes
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => ({
          url: `/uploads/produits/${file.filename}`,
          produitId: produit.id,
        }));
        await Image.bulkCreate(images);
      }
      res.status(201).json({ message: "Produit ajouté avec succès", produit });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
exports.getProduits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    // Récupération des filtres
    const { query, categorieId, sousCategorieId, marqueId } = req.query;

    let whereClause = {};

    // 🔍 Recherche globale sur title et price
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query}%` } }, // Recherche partielle sur le nom du produit
        { price: { [Op.like]: `%${query}%` } }, // Recherche partielle sur le prix
        { newprice: { [Op.like]: `%${query}%` } },
      ];
    }
    if (marqueId !== undefined) {
      whereClause.marqueId = marqueId;
    }
    // Recherche exacte sur categorieId si fourni
    if (categorieId !== undefined) {
      whereClause.categorieId = categorieId;
    }

    // Recherche exacte sur sousCategorieId si fourni
    if (sousCategorieId !== undefined) {
      whereClause.sousCategorieId = sousCategorieId;
    }
    whereClause.archive = false;
    // Séparation du comptage et de la récupération des produits
    const countResult = await Produit.count({
      where: whereClause,
    });

    // Récupération des produits avec pagination
    const produits = await Produit.findAll({
      where: whereClause,
      include: [
        { model: Categorie, attributes: ["id", "name"] },
        { model: SousCategorie, attributes: ["id", "name"] },
        { model: Image, attributes: ["url"] },
        { model: Marque, as: "marque", attributes: ["name"] },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Vérification si des produits ont été récupérés
    if (!produits) {
      return res.status(404).json({ message: "Aucun produit trouvé" });
    }

    // Calcul du nombre total de pages
    const totalPages = countResult > 0 ? Math.ceil(countResult / limit) : 1;

    // Retourner les produits, le total des pages et la page actuelle
    res.json({
      produits,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    // Afficher les détails de l'erreur dans la console du serveur
    res.status(500).json({ message: "Erreur serveur", error: error.message || error });
  }
};
exports.getProduitsByCategorie = async (req, res) => {
  try {
    const { categoryName } = req.params;
    let {
      sousCategorieId,
      title,
      marqueId,
      minPrice = 0,
      maxPrice = 999999,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;

    // Trouver la catégorie par son nom
    const categorie = await Categorie.findOne({ where: { name: categoryName } });
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Récupérer les sous-catégories
    const sousCategoriesList = await SousCategorie.findAll({
      where: { categorieId: categorie.id },
      attributes: ["id", "name"],
    });

    // Gérer les marques multiples (tableau ou string "1,2")
    if (marqueId) {
      if (typeof marqueId === "string") {
        marqueId = marqueId.split(",");
      }
    }

    // Clause WHERE principale
    let whereClause = {
      categorieId: categorie.id,
      price: {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)],
      },
    };

    if (title) {
      if (Array.isArray(title)) {
        whereClause.title = { [Op.in]: title };
      } else {
        whereClause.title = { [Op.like]: `%${title}%` };
      }
    }

    if (sousCategorieId) {
      whereClause.sousCategorieId = sousCategorieId;
    }

    if (marqueId) {
      whereClause.marqueId = { [Op.in]: marqueId };
    }
whereClause.archive = false;
    // Produits filtrés avec détails
    const produits = await Produit.findAll({
      where: whereClause,
      include: [
        { model: Categorie, attributes: ["id", "name"] },
        { model: SousCategorie, attributes: ["id", "name"] },
        { model: Image, attributes: ["url"] },
        { model: Marque, as: "marque", attributes: ["id", "name"] },
      ],
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Compter les produits filtrés
    const countResult = await Produit.count({ where: whereClause });

    // Extraire les marques disponibles dans tous les produits de la catégorie
    const allProduitsForMarques = await Produit.findAll({
      where: sousCategorieId
        ? { categorieId: categorie.id, sousCategorieId }
        : { categorieId: categorie.id },
      include: [{ model: Marque, as: "marque", attributes: ["id", "name"] }],
    });

    const marquesSet = new Map();
    allProduitsForMarques.forEach(p => {
      if (p.marque) {
        marquesSet.set(p.marque.id, p.marque.name);
      }
    });
    const marques = Array.from(marquesSet, ([id, name]) => ({ id, name }));

    let whereForTitles = {
      categorieId: categorie.id,
    };

    if (sousCategorieId) {
      whereForTitles.sousCategorieId = sousCategorieId;
    }

    if (marqueId) {
      whereForTitles.marqueId = { [Op.in]: marqueId };
    }

    const allProduitsForTitles = await Produit.findAll({ where: whereForTitles });
    const prix = allProduitsForMarques.map((p) => p.price);
    const prixMin = Math.min(...prix);
    const prixMax = Math.max(...prix);
    const titres = [...new Set(allProduitsForTitles.map((p) => p.title))];




    // Pagination
    const totalPages = countResult > 0 ? Math.ceil(countResult / limit) : 1;

    res.json({
      marques,
      produits,
      titres,
      sousCategories: sousCategoriesList,
      prixMin,
      prixMax,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getProduitById = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findOne({
      where: { id },
      include: [
        { model: Categorie, attributes: ["name"] },
        { model: SousCategorie, attributes: ["name"] },
        { model: Image, attributes: ["url"] },
        { model: Marque, as: "marque", attributes: ["logo"] },
      ],
    });

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
exports.updateProduit = async (req, res) => {
  const { errors, isValid } = ValidateProduit(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
      const { id } = req.params;
      let {
        title,
        stock,
        price,
        description,
        categorieId,
        sousCategorieId,
        nameCategorie,
        nameSousCategorie,
        marqueId, newprice
      } = req.body;
      if (req.files.length > 5) {
        return res.status(404).json({ images: "Vous ne pouvez télécharger que 5 images maximum" });
      }
      let produit = await Produit.findByPk(id);
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      // Mettre à jour la catégorie si nécessaire
      if (!categorieId && nameCategorie) {
        const [newCategory] = await Categorie.findOrCreate({ where: { name: nameCategorie } });
        categorieId = newCategory.id;
      }

      // Mettre à jour la sous-catégorie si nécessaire
      if (!sousCategorieId && nameSousCategorie) {
        const [newSousCategorie] = await SousCategorie.findOrCreate({
          where: { name: nameSousCategorie, categorieId: categorieId },
        });
        sousCategorieId = newSousCategorie.id;
      }

      // Mise à jour des champs du produit
      await produit.update({
        title,
        stock,
        price,
        description,
        categorieId,
        sousCategorieId,
        marqueId, newprice
      });

      // Mettre à jour les images si elles sont présentes
      if (req.files && req.files.length > 0) {
        await Image.destroy({ where: { produitId: id } }); // Supprimer les anciennes images
        const images = req.files.map((file) => ({
          url: `/uploads/produits/${file.filename}`,
          produitId: id,
        }));
        await Image.bulkCreate(images);
      }
      produit = await Produit.findByPk(id, {
        include: {
          model: Image,
          attributes: ['url']
        }
      });
      res.json(produit);
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
exports.deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Marquer le produit comme archivé
    produit.archive = true;
    await produit.save();

    res.json({ message: "Produit archivé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
exports.searchProduitsByTitle = async (req, res) => {
  try {
    const search = req.query.q || "";
    const limit = 8;

    const whereClause = search
      ? {
        title: {
          [Op.like]: `%${search}%`,
        },
      }
      : {};
whereClause.archive = false;
    const produits = await Produit.findAll({
      where: whereClause,
      include: [
        { model: Categorie, attributes: ["id", "name"] },
        { model: SousCategorie, attributes: ["id", "name"] },
        { model: Image, attributes: ["url"] },
      ],
      limit,
      order: [["createdAt", "DESC"]],
    });

    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la recherche", error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categories = await Categorie.findAll();

    const categoriesWithProducts = await Promise.all(
      categories.map(async (cat) => {
        const produits = await Produit.findAll({
          where: { categorieId: cat.id ,archive: false},
          limit: 4,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Image, attributes: ['url'] },
            { model: SousCategorie, attributes: ['id', 'name'] },
          ],
        });

        return {
          id: cat.id,
          name: cat.name,
          Produits: produits,
        };
      })
    );

    res.json(categoriesWithProducts);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.getProduitsSimilaires = async (req, res) => {
  const produitId = req.params.id;

  try {
    const produit = await Produit.findByPk(produitId);

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    const produitsSimilaires = await Produit.findAll({
      where: {archive: false,
        id: { [Op.ne]: produitId }, // exclure le produit actuel
        [Op.or]: [
          { categorieId: produit.categorieId },
          { sousCategorieId: produit.sousCategorieId }
        ]
      },
      limit: 20, // limite à 10 produits similaires
      include: [
        { model: Image },
        { model: Marque, as: "marque" }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(produitsSimilaires);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
