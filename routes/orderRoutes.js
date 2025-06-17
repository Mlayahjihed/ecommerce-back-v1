const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleare');

// POST /orders - Créer une nouvelle commande
router.post('/add', verifyUser,orderController.createOrder);
// Commandes de l'utilisateur connecté
router.get('/my-orders', verifyUser, orderController.getUserOrders);
// Toutes les commandes (admin seulement)
router.get('/all', verifyAdmin, orderController.getAllOrders);
router.get('/order/:id', verifyAdmin, orderController.getOneOrderById);
router.post('/order/:id/accept', verifyAdmin, orderController.acceptOrder);
router.post('/order/:id/refuse', verifyAdmin, orderController.refuseOrder);

module.exports = router; 