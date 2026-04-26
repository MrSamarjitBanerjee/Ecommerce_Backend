const crypto = require('crypto')
const UserModel = require('../models/userModels')

const verifyResetToken = async (req, res, next) => {
  try {
    const resetToken = req.cookies?.resetToken
    const { email } = req.body

    console.log('verifyResetToken debug:', { resetTokenPresent: !!resetToken, email })

    if (!resetToken || !email) {
      return res.status(401).json({ message: 'Unauthorized: missing reset token or email' })
    }

    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    const user = await UserModel.findOne({
      email,
      forgot_password_otp: hashedResetToken,
      forgot_password_expiry: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(403).json({ message: 'Invalid or expired reset token' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('verifyResetToken error:', err)
    res.status(500).json({ message: 'Token verification failed', error: err.message })
  }
}

module.exports = verifyResetToken
