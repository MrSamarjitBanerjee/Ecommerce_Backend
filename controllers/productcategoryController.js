const CategoryModel = require('../models/categoryModel')
const mongoose = require('mongoose')

// Create Category (Admin only)
exports.createCategoryController = async(req,res)=>{
    try {
        const { name , image } = req.body 

        if(!name || !image){
            return res.status(400).json({
                message : "Enter required fields: name and image",
                error : true,
                success : false
            })
        }

        const categoryExists = await CategoryModel.findOne({ name })
        if(categoryExists){
            return res.status(409).json({
                message : "Category already exists",
                error : true,
                success : false
            })
        }

        const category = await CategoryModel.create({
            name,
            image
        })

        return res.status(201).json({
            message : "Category created successfully",
            data : category,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Get all categories
exports.getAllCategoriesController = async(req,res)=>{
    try {
        const categories = await CategoryModel.find().sort({ createdAt: -1 })

        return res.status(200).json({
            message : "Categories fetched",
            data : categories,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Get category by ID
exports.getCategoryByIdController = async(req,res)=>{
    try {
        const { categoryId } = req.params

        if(!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({
                message : "Invalid category ID",
                error : true,
                success : false
            })
        }

        const category = await CategoryModel.findById(categoryId)

        if(!category){
            return res.status(404).json({
                message : "Category not found",
                error : true,
                success : false
            })
        }

        return res.status(200).json({
            message : "Category fetched",
            data : category,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Update category (Admin only)
exports.updateCategoryController = async(req,res)=>{
    try {
        const { categoryId } = req.params
        const { name, image } = req.body

        if(!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({
                message : "Invalid category ID",
                error : true,
                success : false
            })
        }

        if(!name && !image){
            return res.status(400).json({
                message : "Provide at least one field to update",
                error : true,
                success : false
            })
        }

        const updateData = {}
        if(name) updateData.name = name
        if(image) updateData.image = image

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        )

        if(!updatedCategory){
            return res.status(404).json({
                message : "Category not found",
                error : true,
                success : false
            })
        }

        return res.status(200).json({
            message : "Category updated successfully",
            data : updatedCategory,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Delete category (Admin only)
exports.deleteCategoryController = async(req,res)=>{
    try {
        const { categoryId } = req.params

        if(!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({
                message : "Invalid category ID",
                error : true,
                success : false
            })
        }

        const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId)

        if(!deletedCategory){
            return res.status(404).json({
                message : "Category not found",
                error : true,
                success : false
            })
        }

        return res.status(200).json({
            message : "Category deleted successfully",
            data : deletedCategory,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


exports.AddCategoryController = exports.createCategoryController