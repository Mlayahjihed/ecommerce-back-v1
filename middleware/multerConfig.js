const multer = require("multer");
const path = require("path");

// Définition du stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/produits/"); // Stocker les images dans le dossier "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renommer le fichier
  },
});

// Filtrer les fichiers pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers images sont autorisés"));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
