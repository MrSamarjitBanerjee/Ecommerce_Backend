const CartProductModel = require('../models/cartproductModel')
const ProductModel = require('../models/productModel')
const mongoose = require('mongoose')
const { getRedisClient } = require('../config/redisConfig')

// Add product to cart
exports.addToCartController = async (req, res) => {
    try {
        const { productId } = req.body
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
                error: true,
                success: false
            })
        }

        // Verifying product exists or not
        const product = await ProductModel.findById(productId)
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            })
        }

        // Check if product is published
        if (!product.publish) {
            return res.status(403).json({
                message: "Product is not available",
                error: true,
                success: false
            })
        }

        // Check if product already in cart
        const existingCartProduct = await CartProductModel.findOne({
            productId,
            userId
        })

        if (existingCartProduct) {
            return res.status(409).json({
                message: "Product already in cart",
                error: true,
                success: false
            })
        }

        const cartProduct = await CartProductModel.create({
            productId,
            quantity: 1,
            userId
        })

        await cartProduct.populate('productId')

        // Invalidating cart cache
        const redis = getRedisClient()
        if (redis) {
            try {
                await redis.del(`cart_${userId}`)
                await redis.del(`cartCount_${userId}`)
            } catch (cacheError) {
                console.log('Cache invalidation error:', cacheError)
            }
        }

        return res.status(201).json({
            message: "Product added to cart",
            data: cartProduct,
            success: true,
            error: false
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get user cart
exports.getCartController = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        // Check Redis cache first
        const redis = getRedisClient()
        const cacheKey = `cart_${userId}`
        
        if (redis) {
            try {
                const cachedCart = await redis.get(cacheKey)
                if (cachedCart) {
                    return res.status(200).json(JSON.parse(cachedCart))
                }
            } catch (cacheError) {
                console.log('Cache retrieval error:', cacheError)
            }
        }

        const cartItems = await CartProductModel.find({ userId })
            .populate({
                path: 'productId',
                select: 'name image price discount stock category subCategory'
            })
            .sort({ createdAt: -1 })

        // Calculating totals in the cart
        let totalPrice = 0
        let totalDiscount = 0
        let totalQty = 0

        cartItems.forEach(item => {
            if (item.productId) {
                const itemPrice = item.productId.price * item.quantity
                const itemDiscount = itemPrice * (item.productId.discount / 100)
                
                totalPrice += itemPrice
                totalDiscount += itemDiscount
                totalQty += item.quantity
            }
        })

        const responseData = {
            message: "Cart items fetched",
            data: cartItems,
            summary: {
                totalPrice,
                totalDiscount,
                totalQty,
                totalPayableAmount: totalPrice - totalDiscount
            },
            success: true,
            error: false
        }

        // Storing in Redis cache with 1 hour TTL time
        if (redis) {
            try {
                await redis.setEx(cacheKey, 3600, JSON.stringify(responseData))
            } catch (cacheError) {
                console.log('Cache storage error:', cacheError)
            }
        }

        return res.status(200).json(responseData)

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Updating product quantity in cart
exports.updateCartQuantityController = async (req, res) => {
    try {
        const { cartItemId } = req.params
        const { quantity } = req.body
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).json({
                message: "Invalid cart item ID",
                error: true,
                success: false
            })
        }

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({
                message: "Quantity is required",
                error: true,
                success: false
            })
        }

        const quantityNum = parseInt(quantity)
        if (quantityNum < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
                error: true,
                success: false
            })
        }

        // Verifying if cart item exists and belongs to user
        const cartItem = await CartProductModel.findOne({
            _id: cartItemId,
            userId
        }).populate('productId')

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            })
        }

        // Checking stock availability
        if (cartItem.productId.stock < quantityNum) {
            return res.status(400).json({
                message: `Only ${cartItem.productId.stock} items available in stock`,
                error: true,
                success: false
            })
        }

        const updatedCartItem = await CartProductModel.findByIdAndUpdate(
            cartItemId,
            { quantity: quantityNum },
            { new: true }
        ).populate('productId')

        // Invalidate cart cache
        const redis = getRedisClient()
        if (redis) {
            try {
                await redis.del(`cart_${userId}`)
            } catch (cacheError) {
                console.log('Cache invalidation error:', cacheError)
            }
        }

        return res.status(200).json({
            message: "Cart quantity updated",
            data: updatedCartItem,
            success: true,
            error: false
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Removing product from cart
exports.removeFromCartController = async (req, res) => {
    try {
        const { cartItemId } = req.params
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).json({
                message: "Invalid cart item ID",
                error: true,
                success: false
            })
        }

        const deletedCartItem = await CartProductModel.findOneAndDelete({
            _id: cartItemId,
            userId
        })

        if (!deletedCartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            })
        }

        // Invalidating cart cache
        const redis = getRedisClient()
        if (redis) {
            try {
                await redis.del(`cart_${userId}`)
                await redis.del(`cartCount_${userId}`)
            } catch (cacheError) {
                console.log('Cache invalidation error:', cacheError)
            }
        }

        return res.status(200).json({
            message: "Product removed from cart",
            data: deletedCartItem,
            success: true,
            error: false
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Clearing cart
exports.clearCartController = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        const result = await CartProductModel.deleteMany({ userId })

        // Invalidating cart cache
        const redis = getRedisClient()
        if (redis) {
            try {
                await redis.del(`cart_${userId}`)
                await redis.del(`cartCount_${userId}`)
            } catch (cacheError) {
                console.log('Cache invalidation error:', cacheError)
            }
        }

        return res.status(200).json({
            message: "Cart cleared successfully",
            data: {
                deletedCount: result.deletedCount
            },
            success: true,
            error: false
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Getting total cart document count
exports.getCartCountController = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        // Checking Redis cache first
        const redis = getRedisClient()
        const cacheKey = `cartCount_${userId}`

        if (redis) {
            try {
                const cachedCount = await redis.get(cacheKey)
                if (cachedCount) {
                    return res.status(200).json(JSON.parse(cachedCount))
                }
            } catch (cacheError) {
                console.log('Cache retrieval error:', cacheError)
            }
        }

        const count = await CartProductModel.countDocuments({ userId })

        const responseData = {
            message: "Cart count fetched",
            data: {
                count
            },
            success: true,
            error: false
        }

        // Storing in Redis cache with 1 hour TTL time
        if (redis) {
            try {
                await redis.setEx(cacheKey, 3600, JSON.stringify(responseData))
            } catch (cacheError) {
                console.log('Cache storage error:', cacheError)
            }
        }

        return res.status(200).json(responseData)

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
