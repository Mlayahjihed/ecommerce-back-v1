const express = require('express');
const router = express.Router();
const adminController = require('../controllers/dashbordController');
const {  verifyAdmin } = require('../middleware/authMiddleare');
// Statistiques générales
router.get('/stats', verifyAdmin, adminController.getStats);
module.exports = router;