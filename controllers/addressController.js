const AddressModel = require('../models/addressModels')
const UserModel = require('../models/userModels')
const mongoose = require('mongoose')

// Adding address for logged-in User
exports.addAddressController = async (req, res) => {
    try {
        const { address_line, city, state, pincode, country, mobile } = req.body
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!address_line || !city || !state || !pincode || !country || !mobile) {
            return res.status(400).json({
                message: "Enter required fields: address_line, city, state, pincode, country, mobile",
                error: true,
                success: false
            })
        }

        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                message: "Invalid pincode format (must be 6 digits)",
                error: true,
                success: false
            })
        }

        if (!/^\d{10}$/.test(mobile.toString())) {
            return res.status(400).json({
                message: "Invalid mobile number format (must be 10 digits)",
                error: true,
                success: false
            })
        }

        const address = await AddressModel.create({
            address_line,
            city,
            state,
            pincode,
            country,
            mobile,
            userId,
            status: true
        })

        
        await UserModel.findByIdAndUpdate(userId, {  // pushing address_details to user model
            $push: { address_details: address._id },
            $set: { default_address: address._id }
        })

        return res.status(201).json({
            message: "Address added successfully",
            data: address,
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



// Updating address
exports.updateAddressController = async (req, res) => {
    try {
        const { addressId } = req.params
        const userId = req.userId
        const { address_line, city, state, pincode, country, mobile } = req.body

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                message: "Invalid address ID",
                error: true,
                success: false
            })
        }

        if (!address_line && !city && !state && !pincode && !country && !mobile) {
            return res.status(400).json({
                message: "Provide at least one field to update",
                error: true,
                success: false
            })
        }

        // Validating pincode if given
        if (pincode && !/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                message: "Invalid pincode format (must be 6 digits)",
                error: true,
                success: false
            })
        }

        // Validating  mobile if given
        if (mobile && !/^\d{10}$/.test(mobile.toString())) {
            return res.status(400).json({
                message: "Invalid mobile number format (must be 10 digits)",
                error: true,
                success: false
            })
        }

        const updateData = {}
        if (address_line) updateData.address_line = address_line
        if (city) updateData.city = city
        if (state) updateData.state = state
        if (pincode) updateData.pincode = pincode
        if (country) updateData.country = country
        if (mobile) updateData.mobile = mobile

        const updatedAddress = await AddressModel.findOneAndUpdate(
            { _id: addressId, userId },
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedAddress) {
            return res.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            })
        }

        return res.status(200).json({
            message: "Address updated successfully",
            data: updatedAddress,
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

// Deleting address
exports.deleteAddressController = async (req, res) => {
    try {
        const { addressId } = req.params
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                message: "Invalid address ID",
                error: true,
                success: false
            })
        }

        const deletedAddress = await AddressModel.findOneAndDelete({
            _id: addressId,
            userId
        })

        if (!deletedAddress) {
            return res.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            })
        }

        // Removing address ID from user's address_details and clearing default if needed
        const updateUserData = {
            $pull: { address_details: addressId }
        }

        const user = await UserModel.findById(userId)
        if (user && user.default_address && user.default_address.toString() === addressId) {
            updateUserData.$set = { default_address: null }
        }

        await UserModel.findByIdAndUpdate(userId, updateUserData)

        return res.status(200).json({
            message: "Address deleted successfully",
            data: deletedAddress,
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

// Setting default address
exports.setDefaultAddressController = async (req, res) => {
    try {
        const { addressId } = req.params
        const userId = req.userId

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
                error: true,
                success: false
            })
        }

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                message: "Invalid address ID",
                error: true,
                success: false
            })
        }

        // Verifying the address belongs to the user
        const address = await AddressModel.findOne({
            _id: addressId,
            userId
        })

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                error: true,
                success: false
            })
        }

        // Setting all other addresses to false for this user
        await AddressModel.updateMany(
            { userId },
            { status: false }
        )

        // Setting the selected address as default
        const updatedAddress = await AddressModel.findByIdAndUpdate(
            addressId,
            { status: true },
            { new: true }
        )

        // Updating user's default_address field
        await UserModel.findByIdAndUpdate(userId, {
            $set: { default_address: addressId }
        })

        return res.status(200).json({
            message: "Default address updated successfully",
            data: updatedAddress,
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
