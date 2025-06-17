const express = require("express");
const router = express.Router();
const marqueController = require("../controllers/marqueController");
const upload = require("../middleware/upload");
const {verifyAdmin } = require("../middleware/authMiddleare");

// Public routes
router.get("/", marqueController.getAllMarques);
// Protected admin routes
router.post("/",  verifyAdmin, upload.single('logo'), marqueController.createMarque);
router.delete("/:id", verifyAdmin, marqueController.deleteMarque);

module.exports = router;