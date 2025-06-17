const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET ;

// Vérifie si l'utilisateur est connecté
exports.verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Non autorisé" });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide" });
  }
};

// Vérifie si l'utilisateur est ADMIN
exports.verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Non autorisé" });
  const user = jwt.verify(token, JWT_SECRET);
  req.user = user;
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};
