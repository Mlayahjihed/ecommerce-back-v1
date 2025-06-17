const { Marque, Produit, Image } = require("../models");
const fs = require('fs');
const path = require('path');


module.exports = {
    // Créer une nouvelle marque
    async createMarque(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Le nom de la marque est requis" });
            }

            let logoPath = null;
            if (req.file) {
                logoPath = `uploads/marques/${req.file.filename}`;
            }

            const marque = await Marque.create({
                name,
                logo: logoPath
            });

            res.status(201).json({
                message: "Marque créée avec succès",
                marque
            });

        } catch (error) {
            // Supprimer le fichier uploadé en cas d'erreur
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads/marques', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            res.status(500).json({
                message: "Erreur lors de la création de la marque",
                error: error.message
            });
        }
    },

    // Lister toutes les marques avec pagination
    async getAllMarques(req, res) {
        try {
            const marque = await Marque.findAndCountAll({
                order: [['createdAt', 'DESC']]
            });
            res.json({
                marques: marque
            });

        } catch (error) {
            res.status(500).json({
                message: "Erreur lors de la récupération des marques",
                error: error.message
            });
        }
    },



    // Supprimer une marque et ses produits associés
    async deleteMarque(req, res) {
        try {
            const { id } = req.params;

            const marque = await Marque.findByPk(id, {
                include: [{
                    model: Produit,
                    include: [Image]
                }]
            });

            if (!marque) {
                return res.status(404).json({ message: "Marque non trouvée" });
            }

            // Supprimer le logo de la marque
            if (marque.logo) {
                const logoPath = path.join(__dirname, '../', marque.logo);
                if (fs.existsSync(logoPath)) {
                    fs.unlinkSync(logoPath);
                }
            }

            // Supprimer les images des produits associés
            for (const produit of marque.Produits) {
                for (const image of produit.Images) {
                    const imagePath = path.join(__dirname, '../', image.url);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            }

            // La suppression des produits et images se fera automatiquement grâce au CASCADE
            await marque.destroy();

            res.json({
                message: "Marque, produits associés et leurs images supprimés avec succès"
            });

        } catch (error) {
            res.status(500).json({
                message: "Erreur lors de la suppression de la marque",
                error: error.message
            });
        }
    },


};