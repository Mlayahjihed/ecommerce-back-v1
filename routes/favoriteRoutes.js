const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { verifyUser } = require('../middleware/authMiddleare');

// POST /api/favorites - Ajouter/retirer un favori
router.post('/', verifyUser ,favoriteController.toggleFavorite);

// GET /api/favorites - Récupérer tous les favoris de l'utilisateur
router.get('/fav', verifyUser ,favoriteController.getUserFavorites);

// GET /api/favorites/check - Vérifier si un produit est favori
router.get('/check', verifyUser ,favoriteController.checkFavorite);
 // DELETE /api/favorites/:productId - Retirer un favori
router.delete('/:productId', verifyUser, favoriteController.removeFavorite);
module.exports = router;