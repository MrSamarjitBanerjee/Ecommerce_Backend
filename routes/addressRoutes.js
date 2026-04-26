const express = require('express')
const {addAddressController,updateAddressController, deleteAddressController, setDefaultAddressController} = require('../controllers/addressController')
const addressRouter = express.Router()
const auth = require('../middleware/auth')

// All address routes require authentication
addressRouter.post('/add', auth, addAddressController)
addressRouter.put('/update/:addressId', auth, updateAddressController)
addressRouter.delete('/delete/:addressId', auth, deleteAddressController)
addressRouter.put('/set-default/:addressId', auth, setDefaultAddressController)
module.exports = addressRouter
