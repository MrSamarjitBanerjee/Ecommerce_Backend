const SubCategoryModel = require('../models/subcategory')
const CategoryModel = require('../models/categoryModel')
const mongoose = require('mongoose')

// Creating SubCategory (Admin only)
exports.createSubCategoryController = async (req, res) => {
    try {
        const { name, image, category = [] } = req.body

        if (!name || !image || !category.length) {
            return res.status(400).json({
                message: "Enter required fields: name, image, category",
                error: true,
                success: false
            })
        }

        // Validating category IDs
        const validatedCategories = []
        for (let categoryId of category) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    message: "Invalid category ID format",
                    error: true,
                    success: false
                })
            }
            const categoryExists = await CategoryModel.findById(categoryId)
            if (!categoryExists) {
                return res.status(400).json({
                    message: `Category with ID ${categoryId} not found`,
                    error: true,
                    success: false
                })
            }
            validatedCategories.push(categoryId)
        }

        const subCategoryExists = await SubCategoryModel.findOne({ name })
        if (subCategoryExists) {
            return res.status(409).json({
                message: "SubCategory already exists",
                error: true,
                success: false
            })
        }

        const subCategory = await SubCategoryModel.create({
            name,
            image,
            category: validatedCategories
        })

        return res.status(201).json({
            message: "SubCategory created successfully",
            data: subCategory,
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

// Get subcategories by category ID
exports.getSubCategoriesByCategoryController = async (req, res) => {
    try {
        const { categoryId } = req.params

        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID",
                error: true,
                success: false
            })
        }

        const categoryExists = await CategoryModel.findById(categoryId)
        if (!categoryExists) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            })
        }

        const subCategories = await SubCategoryModel.find({ category: categoryId })
            .populate('category')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: "SubCategories fetched",
            data: subCategories,
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

// Get all subcategories
exports.getAllSubCategoriesController = async (req, res) => {
    try {
        const subCategories = await SubCategoryModel.find()
            .populate('category')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: "SubCategories fetched",
            data: subCategories,
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

// Get subcategory by ID
exports.getSubCategoryByIdController = async (req, res) => {
    try {
        const { subCategoryId } = req.params

        if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                message: "Invalid subCategory ID",
                error: true,
                success: false
            })
        }

        const subCategory = await SubCategoryModel.findById(subCategoryId)
            .populate('category')

        if (!subCategory) {
            return res.status(404).json({
                message: "SubCategory not found",
                error: true,
                success: false
            })
        }

        return res.status(200).json({
            message: "SubCategory fetched",
            data: subCategory,
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

// Update subcategory (Admin only)
exports.updateSubCategoryController = async (req, res) => {
    try {
        const { subCategoryId } = req.params
        const { name, image, category } = req.body

        if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                message: "Invalid subCategory ID",
                error: true,
                success: false
            })
        }

        if (!name && !image && !category) {
            return res.status(400).json({
                message: "Provide at least one field to update",
                error: true,
                success: false
            })
        }

        // Validating category ID if provided
        let validatedCategories = undefined
        if (category && category.length) {
            validatedCategories = []
            for (let categoryId of category) {
                if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                    return res.status(400).json({
                        message: "Invalid category ID format",
                        error: true,
                        success: false
                    })
                }
                const categoryExists = await CategoryModel.findById(categoryId)
                if (!categoryExists) {
                    return res.status(400).json({
                        message: `Category with ID ${categoryId} not found`,
                        error: true,
                        success: false
                    })
                }
                validatedCategories.push(categoryId)
            }
        }

        const updateData = {}
        if (name) updateData.name = name
        if (image) updateData.image = image
        if (validatedCategories) updateData.category = validatedCategories

        const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
            subCategoryId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category')

        if (!updatedSubCategory) {
            return res.status(404).json({
                message: "SubCategory not found",
                error: true,
                success: false
            })
        }

        return res.status(200).json({
            message: "SubCategory updated successfully",
            data: updatedSubCategory,
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

// Delete subcategory (Admin only)
exports.deleteSubCategoryController = async (req, res) => {
    try {
        const { subCategoryId } = req.params

        if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                message: "Invalid subCategory ID",
                error: true,
                success: false
            })
        }

        const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(subCategoryId)

        if (!deletedSubCategory) {
            return res.status(404).json({
                message: "SubCategory not found",
                error: true,
                success: false
            })
        }

        return res.status(200).json({
            message: "SubCategory deleted successfully",
            data: deletedSubCategory,
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


exports.AddSubCategoryController = exports.createSubCategoryController