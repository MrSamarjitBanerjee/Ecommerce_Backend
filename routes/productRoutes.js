const express = require('express')
const {createProductController, getProductsController, getProductByIdController, searchProductsController, updateProductController, deleteProductController} = require('../controllers/productController')
const productRouter = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

// Admin only routes
productRouter.post('/create', auth, admin, createProductController)
productRouter.put('/update/:productId', auth, admin, updateProductController)
productRouter.delete('/delete/:productId', auth, admin, deleteProductController)

// Public routes
productRouter.get('/all', getProductsController)
productRouter.get('/search', searchProductsController)
productRouter.get('/:productId', getProductByIdController)

module.exports = productRouter
