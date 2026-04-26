const express = require('express')
const {addToCartController, getCartController, updateCartQuantityController, removeFromCartController, clearCartController, getCartCountController} = require('../controllers/cartController')
const cartRouter = express.Router()
const auth = require('../middleware/auth')

// All cart routes require authentication
cartRouter.post('/add', auth, addToCartController)
cartRouter.get('/', auth, getCartController)
cartRouter.get('/count', auth, getCartCountController)
cartRouter.put('/update/:cartItemId', auth, updateCartQuantityController)
cartRouter.delete('/remove/:cartItemId', auth, removeFromCartController)
cartRouter.delete('/clear', auth, clearCartController)

module.exports = cartRouter
