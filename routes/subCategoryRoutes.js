const express = require('express')
const {createSubCategoryController, getSubCategoriesByCategoryController, getAllSubCategoriesController, getSubCategoryByIdController, updateSubCategoryController, deleteSubCategoryController} = require('../controllers/subCategoryController')
const subCategoryRouter = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

// Admin only routes
subCategoryRouter.post('/create', auth, admin, createSubCategoryController)
subCategoryRouter.put('/update/:subCategoryId', auth, admin, updateSubCategoryController)
subCategoryRouter.delete('/delete/:subCategoryId', auth, admin, deleteSubCategoryController)

// Public routes
subCategoryRouter.get('/all', getAllSubCategoriesController)
subCategoryRouter.get('/:subCategoryId', getSubCategoryByIdController)
subCategoryRouter.get('/category/:categoryId', getSubCategoriesByCategoryController)



module.exports = subCategoryRouter
