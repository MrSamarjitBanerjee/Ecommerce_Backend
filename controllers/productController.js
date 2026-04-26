const ProductModel = require('../models/productModel')
const mongoose = require('mongoose')
const SubCategoryModel = require('../models/subcategory')
const CategoryModel = require('../models/categoryModel')

// Create Product (Admin only)
exports.createProductController = async (req, res) => {
    try {
        const {
            name,
            image = [],
            category = [],
            subCategory = [],
            unit = "",
            stock = 0,
            price,
            discount = 0,
            description = "",
            more_details = {},
            publish = true
        } = req.body

        if (
            !name ||
            !image.length ||
            !category.length ||
            !subCategory.length ||
            price === undefined
        ) {
            return res.status(400).json({
                message: "Required fields missing: name, image, category, subCategory, price",
                success: false,
                error: true
            })
        }

        // Validate category IDs
        for (let categoryId of category) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    message: "Invalid category ID format",
                    success: false,
                    error: true
                })
            }
            const categoryExists = await CategoryModel.findById(categoryId)
            if (!categoryExists) {
                return res.status(400).json({
                    message: `Category with ID ${categoryId} not found`,
                    success: false,
                    error: true
                })
            }
        }

        // Validate subCategory IDs and their relationship with categories
        for (let subCategoryId of subCategory) {
            if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
                return res.status(400).json({
                    message: "Invalid subCategory ID format",
                    success: false,
                    error: true
                })
            }
            const subCategoryExists = await SubCategoryModel.findById(subCategoryId)
            if (!subCategoryExists) {
                return res.status(400).json({
                    message: `SubCategory with ID ${subCategoryId} not found`,
                    success: false,
                    error: true
                })
            }

            // Verifying if subcategory belongs to one of the provided categories
            const isValidRelationship = subCategoryExists.category.some(cat => 
                category.some(c => c.toString() === cat.toString())
            )
            if (!isValidRelationship) {
                return res.status(400).json({
                    message: `SubCategory ${subCategoryId} does not belong to provided categories`,
                    success: false,
                    error: true
                })
            }
        }

        const product = await ProductModel.create({
            name,
            image,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            publish
        })

        res.status(201).json({
            message: "Product created successfully",
            data: product,
            success: true,
            error: false
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}

// Get all products(pagination and search )
exports.getProductsController = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query
        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)

        const query = { publish: true }

        if (search) {
            query.$text = { $search: search }
        }

        const skip = (pageNum - 1) * limitNum

        const products = await ProductModel.find(query)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .populate('category')
            .populate('subCategory')

        const totalProducts = await ProductModel.countDocuments(query)
        const totalPages = Math.ceil(totalProducts / limitNum)

        res.status(200).json({
            message: "Products fetched successfully",
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalProducts,
                totalPages
            },
            success: true,
            error: false
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}

// Get product details by ID
exports.getProductByIdController = async (req, res) => {
    try {
        const { productId } = req.params

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false,
                error: true
            })
        }

        const product = await ProductModel.findById(productId)
            .populate('category')
            .populate('subCategory')

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            })
        }

        // Check if product is published (only published products visible to public)
        if (!product.publish) {
            return res.status(403).json({
                message: "Product is not available",
                success: false,
                error: true
            })
        }

        res.status(200).json({
            message: "Product fetched successfully",
            data: product,
            success: true,
            error: false
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}

// Search products
exports.searchProductsController = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query
        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)

        if (!search) {
            return res.status(400).json({
                message: "Search query is required",
                success: false,
                error: true
            })
        }

        const skip = (pageNum - 1) * limitNum

        const products = await ProductModel.find(
            { $text: { $search: search }, publish: true },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limitNum)
            .populate('category')
            .populate('subCategory')

        const totalProducts = await ProductModel.countDocuments({
            $text: { $search: search },
            publish: true
        })
        const totalPages = Math.ceil(totalProducts / limitNum)

        res.status(200).json({
            message: "Products found",
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalProducts,
                totalPages
            },
            success: true,
            error: false
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}

// Update product ( Admin only , partial update )
exports.updateProductController = async (req, res) => {
    try {
        const { productId } = req.params
        const updateData = req.body

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false,
                error: true
            })
        }

        // Validating category IDs if provided
        if (updateData.category && updateData.category.length) {
            for (let categoryId of updateData.category) {
                if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                    return res.status(400).json({
                        message: "Invalid category ID format",
                        success: false,
                        error: true
                    })
                }
                const categoryExists = await CategoryModel.findById(categoryId)
                if (!categoryExists) {
                    return res.status(400).json({
                        message: `Category with ID ${categoryId} not found`,
                        success: false,
                        error: true
                    })
                }
            }
        }

        // Validating subCategory IDs if provided
        if (updateData.subCategory && updateData.subCategory.length) {
            const categories = updateData.category || (await ProductModel.findById(productId)).category
            
            for (let subCategoryId of updateData.subCategory) {
                if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
                    return res.status(400).json({
                        message: "Invalid subCategory ID format",
                        success: false,
                        error: true
                    })
                }
                const subCategoryExists = await SubCategoryModel.findById(subCategoryId)
                if (!subCategoryExists) {
                    return res.status(400).json({
                        message: `SubCategory with ID ${subCategoryId} not found`,
                        success: false,
                        error: true
                    })
                }

                const isValidRelationship = subCategoryExists.category.some(cat => 
                    categories.some(c => c.toString() === cat.toString())
                )
                if (!isValidRelationship) {
                    return res.status(400).json({
                        message: `SubCategory ${subCategoryId} does not belong to provided categories`,
                        success: false,
                        error: true
                    })
                }
            }
        }

        // Validating discount range if provided
        if (updateData.discount !== undefined && (updateData.discount < 0 || updateData.discount > 100)) {
            return res.status(400).json({
                message: "Discount must be between 0 and 100",
                success: false,
                error: true
            })
        }

        // Validating stock if provided
        if (updateData.stock !== undefined && updateData.stock < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative",
                success: false,
                error: true
            })
        }

        // Validating price if provided
        if (updateData.price !== undefined && updateData.price < 0) {
            return res.status(400).json({
                message: "Price cannot be negative",
                success: false,
                error: true
            })
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category').populate('subCategory')

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            })
        }

        res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct,
            success: true,
            error: false
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}

// Delete product (Admin only)
exports.deleteProductController = async (req, res) => {
    try {
        const { productId } = req.params

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false,
                error: true
            })
        }

        const deletedProduct = await ProductModel.findByIdAndDelete(productId)

        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            })
        }

        res.status(200).json({
            message: "Product deleted successfully",
            data: deletedProduct,
            success: true,
            error: false
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            error: true
        })
    }
}
