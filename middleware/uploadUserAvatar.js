const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const uploadPath = path.join(__dirname, "../uploads/users", userId.toString());

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMime = allowedTypes.test(file.mimetype);

  if (isExt && isMime) {
    return cb(null, true);
  }
  cb(new Error("Seuls les fichiers images sont autorisés"));
};

const uploadAvatar = multer({ storage, fileFilter });

module.exports = uploadAvatar;
