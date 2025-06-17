const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController");

router.get("/", categorieController.getCategories);
router.get("/sousCategories",categorieController.getSousCategoriesByCategorie);
module.exports = router;
