// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const uploadCommentImage = require('../middleware/uploadCommentImage');
const { verifyUser } = require('../middleware/authMiddleare');

// Créer un commentaire
router.post('/', verifyUser, uploadCommentImage.single('image'), commentController.createComment);

// Récupérer les commentaires d'un produit
router.get('/product/:productId', commentController.getCommentsByProduct);
router.get('/products', commentController.getCommentsByProducts);
// Supprimer un commentaire
router.delete('/:id', verifyUser, commentController.deleteComment);

module.exports = router;
