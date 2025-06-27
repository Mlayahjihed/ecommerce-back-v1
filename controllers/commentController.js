// controllers/commentController.js
const { Comment, User, Produit, Image } = require('../models');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
exports.createComment = async (req, res) => {
  try {
    const { text, productId } = req.body;
    const userId = req.user.id;

    if (!text || !productId) {
      return res.status(400).json({ message: 'Texte et ID du produit requis' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `uploads/comments/${req.file.filename}`;
    }

    const comment = await Comment.create({
      text,
      imageUrl,
      userId,
      productId
    });

    res.status(201).json({ message: 'Commentaire créé avec succès', comment });
  } catch (error) {
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/comments', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: 'Erreur lors de la création du commentaire', error: error.message });
  }
};

exports.getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.findAll({
      where: { productId },
      include: [
        {
          model: User,
          attributes: ['id', 'user_name','photo_url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    

    // Supprimer l'image associée si elle existe
    if (comment.imageUrl) {
      const imagePath = path.join(__dirname, '../', comment.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await comment.destroy();

    res.status(200).json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire', error: error.message });
  }
};
exports.getCommentsByProducts = async (req, res) => {
  try {
    const { page = 1, limit = 8, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};

    const includeOptions = [
      {
        model: User,
        attributes: ['id', 'user_name', 'photo_url'],
        where: search
          ? {
              user_name: {
                [Op.like]: `%${search}%`
              }
            }
          : undefined,
        required: search ? true : false // 🔥 inner join si recherche
      },
      {
        model: Produit,
        attributes: ['id', 'title'],
        include: [
          {
            model: Image,
            attributes: ['url']
          }
        ],
        required: false
      }
    ];
 
    // 🔎 Comptage total pour pagination
    const countResult = await Comment.count({
      include: includeOptions,
      where: whereCondition
    });

    // 📥 Récupération des commentaires paginés
    const comments = await Comment.findAll({
      where: whereCondition,
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalPages = countResult > 0 ? Math.ceil(countResult / limit) : 1;

    res.status(200).json({
      success: true,
      comments,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
};

