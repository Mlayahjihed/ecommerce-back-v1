const { User } = require("../models");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ValidateLogin = require("../validation/login");
const  ValidateRegister = require("../validation/register");
const  ValidateForget = require("../validation/forget");
const  ValidateReset = require("../validation/reset");
const  ValidateProfil = require("../validation/profil");
const sendEmail = require("../util/sendEmail");
const { Op } = require("sequelize");
const JWT_SECRET = process.env.JWT_SECRET;
exports.register = async (req, res) => {
  const { errors, isValid } = ValidateRegister(req.body);
  try {
    if(!isValid){
      res.status(404).json(errors)
     }else{
    const { user_name, email, password  } = req.body;
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ email : "Cet email est déjà utilisé" });
    }
     const existingUser2 = await User.findOne({ where: { user_name } });
    if (existingUser2) {
      return res.status(400).json({ user_name : "Cet user_name est déjà utilisé" });
    }
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    // Créer un nouvel utilisateur
    const newUser = await User.create({
      user_name,
      email,
      password: hashedPassword,
    });
    // Convertir en objet brut et supprimer le mot de passe
    const userData = newUser.toJSON();
    delete userData.password;
    res.status(201).json({ message: "Utilisateur créé avec succès !" ,user: userData,});}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.login = async (req, res) => {
const { errors, isValid } = ValidateLogin(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
    const { email, password } = req.body;
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ general: "Email ou mot de passe incorrect" });
    }
    if (user.ban === true) {
      return res.status(403).json({ general: "Utilisateur banni. Veuillez contacter l'administrateur." });
    }
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ general: "Email ou mot de passe incorrect" });
    }
    // Créer un objet utilisateur sans le mot de passe
    const userData = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      photo_url :user.photo_url
    };
    // Générer un token JWT avec toutes les infos de l'utilisateur
    const token = jwt.sign(userData, JWT_SECRET);
    // Envoyer l'utilisateur + token dans un cookie
   res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000});
    res.status(200).json({ token: token });
  }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = (req, res) => {
  res.status(200).json(req.user);
};
exports.logout = (req, res) => {
  res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/", // 💥 obligatoire
});
  res.status(200).json({ message: "Déconnexion réussie" });
};
exports.forget = async (req, res) => {
  const { errors, isValid } = ValidateForget(req.body);
  try {
    if(!isValid){
      res.status(404).json(errors)
     }else{
      const {  email } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        return res.status(400).json({ email : "mail nexiste pas" });
      }
      // Générer un token sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expireToken = Date.now() + 2 * 60 * 1000; // expire dans 2 minutes

    // Enregistrer le token et sa date d'expiration dans la BDD
    existingUser.reset_token = resetToken;
    existingUser.expire_token = new Date(expireToken);
    await existingUser.save();

      // Create reset url to email to provided email
  const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;
  // HTML Message
  const message = `
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #e0e0e0; border-radius: 10px; font-family: Arial, sans-serif;">
    <h2 style="color: #0d9488;">Réinitialisation de votre mot de passe</h2>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder :</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="
        background-color: #2dd4bf;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        display: inline-block;
      ">
        Réinitialiser le mot de passe
      </a>
    </div>

    <p>Ou copiez-collez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
    
    <p style="color: gray; font-size: 12px;">Ce lien expirera dans 2 minutes pour des raisons de sécurité.</p>
  </div>
`;
await sendEmail({
  to: existingUser.email,
  subject: "Réinitialisation du mot de passe",
  text: message
});
    res.status(201).json({ message: "mail envoyer avec succes!" });}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.reset = async (req, res) => {
  const { errors, isValid } = ValidateReset(req.body);
  try {
    if(!isValid){
      res.status(404).json(errors)
     }else{
      const resetToken = req.params.token;
      const { password } = req.body;
      const user = await User.findOne({ where: { reset_token: resetToken } });
      if (!user) {
        return res.status(400).json({ general: "Lien invalide ou expiré." });
      }
       // 2. Vérifier que le token n'est pas expiré
    if (user.expire_token < Date.now()) {
      return res.status(400).json({ general: "Le lien a expiré. Veuillez refaire une demande." });
    }
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    // 4. Mettre à jour le mot de passe + reset des tokens
    user.password = hashedPassword;
    user.reset_token = null;
    user.expire_token = Date.now(); // pour info, ou mets `null` si tu préfères
    await user.save();
    res.status(201).json({ message: "mot passe modier avec succee!" });}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.reset2 = async (req, res) => {
  const { errors, isValid } = ValidateReset(req.body);
  try {
    if(!isValid){
      res.status(404).json(errors)
     }else{
      const id = req.user.id;
      const { password } = req.body;
      const user = await User.findOne({ where: { id: id } });
      if (!user) {
        return res.status(400).json({ general: "user introuvable." });
      }
     
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    //  Mettre à jour le mot de passe + reset des tokens
    user.password = hashedPassword;
    await user.save();
    res.status(201).json({ message: "mot passe modier avec succee!" });}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateProfile = async (req, res) => {
  
  const { errors, isValid } = ValidateProfil(req.body);
  try {
    if(!isValid){
      res.status(400).json(errors)
     }else{
    const id = req.user.id;
    const { email, user_name } = req.body;

    const user = await User.findOne({ where: { id: id } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    const user2 = await User.findOne({ where: { id: { [Op.ne]: id } ,email: email } });
    if (user2) {
      return res.status(400).json({ email: "email deja existe" });
    }
    if (email) user.email = email;
    if (user_name) user.user_name = user_name;

    await user.save();
    const userData = {
      id: user.id,
      user_name:user_name,
      email: email,
      role: user.role,
      photo_url: user.photo_url
    };
    
    const token = jwt.sign(userData, JWT_SECRET);
    
     res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 jour
    });
    
    return res.status(200).json({ message: "Profil mis à jour avec succès" });
 } } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    user.photo_url = `uploads/users/${user.id}/${req.file.filename}`;
    await user.save();

    // Optionnel : régénérer un token si tu veux mettre à jour immédiatement
    const userData = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      photo_url: user.photo_url
    };
    const token = jwt.sign(userData, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Photo de profil mise à jour", photo_url: user.photo_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.ban = true;
    await user.save();

    res.status(200).json({ success: true, message: "Utilisateur banni avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



  exports.getAllUsersWithRoleUser = async (req, res) => {
    try {
      const { page = 1, limit = 10 ,search = ''} = req.query;
    const offset = (page - 1) * limit;
    const whereCondition = {
      role: 'USER',
      ban: false,
    };
    if (search) {
          // Recherche par ID exact OU par user_name et amil (LIKE %search%)
          if (!isNaN(search)) {
            whereCondition.id = search;
          } else {
            whereCondition[Op.or] = [
              { user_name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
            ];
          }
        }
    const countResult = await User.count({
      where: whereCondition,
    });
      const users = await User.findAll({
        where: whereCondition,
        attributes: { exclude: ['password'] }, // on exclut le mot de passe
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      const totalPages = countResult > 0 ? Math.ceil(countResult / limit) : 1;

      res.status(200).json({
        success: true,
        users,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };