const { Order, OrderProduct,Produit, Image, User } = require('../models');
const  ValidateOrder = require("../validation/order");
const { Op } = require('sequelize');

exports.createOrder = async (req, res) => {
   const { errors, isValid } = ValidateOrder(req.body.customer);
  try {
    const { customer, products } = req.body;
    if(!isValid){
      res.status(404).json(errors)
     }else{
      const order = await Order.create({
        ...customer,
        userId: req.user.id // Association de l'utilisateur
      });
      
    // 2. Ajouter les produits avec leurs quantités
    const orderProducts = await Promise.all(
      products.map(async (product) => {
        // Vérifier que le produit existe
        const dbProduct = await Produit.findByPk(product.id);
        if (!dbProduct) {
          throw new Error(`Produit ${product.id} introuvable`);
        }
        const priceToUse = product.newprice > 0 ? product.newprice : product.price;
        return OrderProduct.create({
          OrderId: order.id,
          ProductId: product.id,
          quantity: product.quantity,
           priceproduct: priceToUse
          
        });
      })
    );

    res.status(201).json({
      success: true,
      orderId: order.id,
      products: orderProducts.map(op => ({
        productId: op.ProductId,
        quantity: op.quantity
      }))
    });
  }
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
   

    const { page = 1, limit = 8 ,search = ''} = req.query;
    const offset = (page - 1) * limit;
    const whereCondition = {};

    if (search) {
      // Recherche par ID exact OU par nom ou prénom (LIKE %search%)
      if (!isNaN(search)) {
        whereCondition.id = search;
      } else {
        whereCondition[Op.or] = [
          { nom: { [Op.like]: `%${search}%` } },
          { prenom: { [Op.like]: `%${search}%` } },
        ];
      }
    }
    const countResult = await Order.count({
      where: whereCondition,
    });
    const  orders  = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Produit,
          through: { 
            attributes: ['quantity',"priceproduct" ] 
          },
          attributes: ['id', 'title'],
          include: [{
            model: Image, // Adding the Image model in case the `Produit` has images
            attributes: ['url'], // Fetch only the `url` of the image
          }],
        },
        {
          model: User, // Assurez-vous d'avoir importé le modèle User
          attributes: ['user_name', 'id', 'email','photo_url']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    const totalPages = countResult > 0 ? Math.ceil(countResult / limit) : 1;
   
    res.status(200).json({
      success: true,
      orders: orders.rows,
      totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
};
// controllers/orderController.js
exports.getUserOrders = async (req, res) => {
  try {
    // Get pagination parameters from the query string, with defaults
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 8; // Default to 10 results per page
    const offset = (page - 1) * limit; // Calculate offset for pagination
    const countResult = await Order.count({
      where: { userId: req.user.id },});
    // Fetch orders with pagination
    const orders = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: [{
        model: Produit,
        through: {
          attributes: ['quantity',"priceproduct"], // Ensuring quantity is included
        },
        attributes: ['id', 'title',], // Ensuring only needed fields from `Produit` are fetched
        include: [{
          model: Image, // Adding the Image model in case the `Produit` has images
          attributes: ['url'], // Fetch only the `url` of the image
        }],
      }],
      order: [['createdAt', 'DESC']], // Sorting by createdAt field
      limit: limit, // Limit the number of records per page
      offset: offset, // Apply the offset for pagination
    });

    // Calculate total number of pages
    const totalPages = countResult > 0 ? Math.ceil(countResult / limit) : 1;
    // Send paginated response
    res.status(200).json({
      orders: orders.rows, // The actual data returned
      currentPage: page, // Current page number
     totalPages, // Total number of pages
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

exports.getOneOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: Produit,
          through: { attributes: ['quantity',"priceproduct"] },
          attributes: ['id', 'title', 'price', 'newprice', 'stock'],
          include: [
            {
              model: Image,
              attributes: ['url'],
            },
          ],
        },
        {
          model: User,
          attributes: ['user_name', 'id', 'email', 'photo_url'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
};
exports.acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: Produit,
          through: { attributes: ['quantity'] },
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }

    // Vérifie stock
    const stockProbleme = order.Produits.some(product => product.stock < product.OrderProduct.quantity);
    if (stockProbleme) {
      return res.status(400).json({ success: false, error: 'Stock insuffisant pour certains produits' });
    }

    // Retirer la quantité commandée du stock
    for (const product of order.Produits) {
      product.stock -= product.OrderProduct.quantity;
      await product.save(); // Met à jour chaque produit
    }

    // Modifier le statut
    order.status = 'accepté';
    await order.save();

    res.status(200).json({ success: true, message: 'Commande acceptée' });

  } catch (error) {
    console.error('Erreur lors de l\'acceptation de la commande:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};
exports.refuseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: Produit,
          through: { attributes: ['quantity'] },
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }

    // Si l'ancienne commande était acceptée ➔ on remet le stock
    if (order.status === 'accepté') {
      for (const product of order.Produits) {
        product.stock += product.OrderProduct.quantity;
        await product.save(); // Update stock produit
      }
    }

    // Modifier le statut
    order.status = 'refusé';
    await order.save();

    res.status(200).json({ success: true, message: 'Commande refusée' });

  } catch (error) {
    console.error('Erreur lors du refus de la commande:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

