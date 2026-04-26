const express = require('express')
const {createCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController, deleteCategoryController} = require('../controllers/productcategoryController')
const categoryRouter = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

// Admin only routes
categoryRouter.post('/create', auth, admin, createCategoryController)
categoryRouter.put('/update/:categoryId', auth, admin, updateCategoryController)
categoryRouter.delete('/delete/:categoryId', auth, admin, deleteCategoryController)

// Public routes
categoryRouter.get('/all', getAllCategoriesController)
categoryRouter.get('/:categoryId', getCategoryByIdController)



module.exports = categoryRouter
