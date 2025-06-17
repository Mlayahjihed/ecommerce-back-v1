const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require("./routes/auth_Routes");
require('dotenv').config();
const categorieRoutes = require("./routes/categorieRoutes");
const produitRoutes = require("./routes/produitRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashbordRoutes = require("./routes/dashbordRoutes");
const  marqueRoutes = require("./routes/marqueRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const commentRoutes = require('./routes/commentRoutes');

const path = require('path');

app.use(cors({
    origin: "https://ecommerce-front-v1-alpha.vercel.app/", // Autorise uniquement ton frontend
    credentials: true // Autorise l'envoi des cookies et headers d'authentification
  }));
// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//all Api 
app.use("/api/auth", authRoutes);
app.use('/api/marques', marqueRoutes);
app.use("/api/produits", produitRoutes);

app.use("/api/categories", categorieRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/dashbord', dashbordRoutes);
// Routes
app.use("/api/favorites", favoriteRoutes);
app.use('/api/comments', commentRoutes);

const port = process.env.PORT
sequelize.sync().then(() => {
        console.log('✅ Database synchronized!');
        app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
    }).catch(err => console.error(' Database sync failed:', err));
