const express = require("express");
const AuthController = require("../controllers/AuthController");
const { verifyUser, verifyAdmin } = require("../middleware/authMiddleare");
const uploadAvatar = require("../middleware/uploadUserAvatar");
const router = express.Router();
router.post("/reset/:token", AuthController.reset);
router.post("/forget", AuthController.forget);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", verifyUser, AuthController.getMe);
router.post("/reset2", verifyUser, AuthController.reset2);  
router.post("/updateprofile", verifyUser, AuthController.updateProfile);
router.post("/logout", AuthController.logout);
router.patch('/ban/:id', verifyAdmin, AuthController.banUser);
router.post("/update-avatar", verifyUser, uploadAvatar.single("avatar"), AuthController.updateAvatar);
router.get('/users', verifyAdmin, AuthController.getAllUsersWithRoleUser);
module.exports = router;
