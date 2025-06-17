const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");
const upload = require("../middleware/multerConfig");
const {  verifyAdmin } = require("../middleware/authMiddleare");

router.post("/add",verifyAdmin, upload.array("images", 30), produitController.addProduit); // Max 5 images
router.get("/", produitController.getProduits);
router.get("/:id", produitController.getProduitById); // Récupérer un produit par ID
router.put("/update/:id",verifyAdmin, upload.array("images", 30), produitController.updateProduit); // Mettre à jour un produit
router.delete("/delete/:id",verifyAdmin, produitController.deleteProduit); // Supprimer un produit par ID
router.get("/by-category/:categoryName", produitController.getProduitsByCategorie);
router.get("/title/e", produitController.searchProduitsByTitle);
router.get('/by/categorie', produitController.getProductsByCategory);
router.get("/similaires/:id", produitController.getProduitsSimilaires);
module.exports = router;
