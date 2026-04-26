const UserModel = require('../models/userModels')

const admin = async (req, res, next) => {
    try {
        const userId = req.userId // from auth middleware

        const user = await UserModel.findById(userId)

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                message: "Access denied. Admin only.",
                error: true,
                success: false
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Authorization error",
            error: true,
            success: false
        })
    }
}

module.exports = admin
