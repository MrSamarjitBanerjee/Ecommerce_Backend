const express = require('express')
const UserRouter = express.Router()
const {RegisterUserController,
    VerifyEmailController,
    UserLoginController,
    UserLogoutController,
    uploadUserAvatarController,
    updateUserDetailsController,
    forgotPasswordController,
    verifyForgotPasswordOtpController,
    resetPasswordController,
    accessTokenGenerationController,
    makeAdminController} = require('../controllers/userController')

const {upload} = require('../middleware/multer')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const verifyResetToken = require('../middleware/verifyMiddleware')




// Routes
UserRouter.post('/register' , RegisterUserController )
UserRouter.get('/verify-user' , VerifyEmailController)
UserRouter.post('/login', UserLoginController )
UserRouter.get('/logout' , auth ,  UserLogoutController)
UserRouter.put('/upload-avatar' , auth , upload.single('avatar') ,uploadUserAvatarController)
UserRouter.put('/update-user', auth , updateUserDetailsController )
UserRouter.put('/forget-password',forgotPasswordController )
UserRouter.put('/verify-otp',verifyForgotPasswordOtpController )
UserRouter.put('/reset-password', verifyResetToken ,resetPasswordController )
UserRouter.post('/refresh-token', accessTokenGenerationController)
UserRouter.put('/make-admin', auth, admin, makeAdminController)

module.exports = UserRouter

