const UserModel = require('../models/userModels')
const bcryptjs = require('bcryptjs')
const sendEmail = require('../config/sendEmail')
const verifyEmailTemplate = require('../utils/verifyEmailTemplate')
const refreshTokenGenerate = require('../utils/refreshTokenGenerate')
const accessTokenGenerate = require('../utils/accessTokenGenerate')
const jwt = require('jsonwebtoken')
const {uploadImageToCloudinary} = require('../utils/uploadImageCloudinary')
const generateOTP = require('../utils/generateOTP')
const forgotPasswordTemplate = require('../utils/forgotPasswordTemplate')
const crypto = require('crypto')





// Make Admin Controller (requires caller to be ADMIN)
exports.makeAdminController = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        error: true,
        success: false
      })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: true,
        success: false
      })
    }

    user.role = 'ADMIN'
    await user.save()

    return res.status(200).json({
      message: 'User promoted to admin successfully',
      error: false,
      success: true,
      data: {
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Error promoting user to admin',
      error: true,
      success: false
    })
  }
}


// User Registration Controller
exports.RegisterUserController = async(req,res) =>{
    try{
        const {name , email , password, adminKey } = req.body; // destructuring from request body
        // check if all fields provided or not

        if( !name || !email || !password){
            return res.status(500).json({
                error: true,
                message : 'Please Provide Name , Email and Password'
            })
        }

        // checking if already registered or user exists in DB
        const user = await UserModel.findOne({email})
        if(user){
            return res.status(409).json({
                message: "User Already Exists",
                error : true,
                success: false
            })
        }
        
       
        const salt = await bcryptjs.genSalt(10) 
        const hashedPassword = await bcryptjs.hash(password,salt)
    
        const payload = {
            name,
            email,
            password : hashedPassword
        }

        // Check admin secret key for admin registration
        if (adminKey === process.env.ADMIN_SECRET_KEY) {
            payload.role = 'ADMIN'
        }

        // saving in Db

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        // verifying email
        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/api/user/verify-user?code=${save?._id}`;

        const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "Verifying email from blinkit",
            html : verifyEmailTemplate({
                name,
                url : VerifyEmailUrl
            })
        })

        return res.json({
            message : "User register successfully",
            error : false,
            success : true,
            data : save
        })

        
    }
    catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
         })
    }
}


// Email Verification Controller for Checking verification Code
exports.VerifyEmailController = async(req,res)=>{
    try{ 
        const {code} = req.query;
        const user = await UserModel.findOne({_id : code})
        if(!user){
            return res.status(400).json({
                message : "Invalid Code",
                error : true,
                success : false
            })
        }

        // if email verify succesful then changing the verify_email field to True
        const updateUser = await UserModel.updateOne({ _id : code}, {verify_email:true})

        return res.status(200).json({
            success: true,
            message : 'Email Verificaton Successful',
            error: false

        })
    }
    catch(error){
        console.log('Error Verifying Email', error)
        return res.status(500).json({
            message :  error.message || error ,
            error : true,
         })      
    }

}


//Login Controller
exports.UserLoginController = async(req,res)=>{
      // fetching user(email,pass) inputs from req body
    const {email,password} = req.body;
    try {
        
        if(!email || !password){
            return res.status(400).json({
                message : 'Email or password field is missing!',
                error : true ,
                success: false
            })
        }

        const user = await UserModel.findOne({email}) // Checking if Email Exists in DB
        
        if( !user || user.status!=='Active'){        // if user is InActive return error
            return res.status(400).json({
                message: 'User not found or account is inactive',
                error: true,
                success: false
            })
        }

        // Comparing password from user input & Db's password
        const checkUserPassword  = await bcryptjs.compare(password, user.password)

        if(!checkUserPassword){     
            console.log(`Login Failed: Username:${user.name}, Email:${user.email}, UserID:${user._id}`)
            return res.status(400).json({
                message: 'Login Failed, Wrong Password',
                error: true,
                success: false
            })
         }


         // Generating the jwt Access & Refresh tokens
        const accessToken = await accessTokenGenerate(user._id)
        const refreshToken = await refreshTokenGenerate(user._id)

        // Setting Session Cookie

         const cookieOptions = {
            // HTTP Cookie attributes
            httpOnly : true,
            secure: true,
            sameSite: "None"
         }

        res.cookie('accessToken', accessToken, cookieOptions  ); // Sets cookies in response
        res.cookie('refreshToken', refreshToken, cookieOptions );

        console.log(`Login Successful: Username:${user.name}, Email:${user.email}, UserID:${user._id}`)



    return res.json({
            message : "Login Successful",
            error: false,
            success: true,
            data : {
                accessToken,
                refreshToken
            }
        })     
        

    }
    catch(error){
        res.status(500).json({
            error_message :  error.message || error,
            message: 'Login Failed, try Registering',
            error: true,
            success: false
    })
}

}

// Logout Controller
exports.UserLogoutController = async(req,res)=>{
    try{
        const userId = req.userId; // from auth middleware
        console.log('Logging out user with ID:', userId)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
            refresh_token : ""
        })

        const cookieOptions = {
            // HTTP Cookie attributes
            httpOnly : true,
            secure: true,
            sameSite: "None"
         }

        res.clearCookie("accessToken",cookieOptions)
        res.clearCookie("refreshToken",cookieOptions)


        console.log('User Logged Out')

        return res.status(200).json({

            message: "Logout successful",
            success: true,
            error: false,
            
        })
    }
    catch(e){
        res.status(500).json({
            message : e.message || "Logout Error!",
            error : true,
            success: false

        })

    }

}


// avatar controller for image upload

exports.uploadUserAvatarController = async(req,res) =>{
    try{
        const userId = req.userId // from auth middleware
        const image = req.file // from multer middleware
        
        if(!image){
            return res.status(400).json({
                message : "No image file provided",
                error: true
            })
        }
        
        const uploadfile = await uploadImageToCloudinary(image)
        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : uploadfile.url
        } )


        return res.status(200).json({
            message : "Avatar Successfully Added",
            data: {
                _id : userId,
                avatar : uploadfile.url,
                
            }
        })

    }
    catch(error){
        console.log('Avatar Upload Error:', error)
        res.status(500).json({
            message: error.message || "Error Uploading Avatar",
            error: true
        })
    }


}


// Update User Details when user is Logged in
exports.updateUserDetailsController  = async(req,res) =>{
    try{
        const userId = req.userId;
        const {name,email,mobile,password} = req.body

        let hashpass = ""
        // encrypting the user's new password
        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashpass = await bcryptjs.hash(password,salt)
        }


        const updateData = {}
            if (name) updateData.name = name
            if (email) updateData.email = email
            if (mobile) updateData.mobile = mobile
            if (password) updateData.password = hashpass

        // Check email uniqueness if provided
        if(email){
            const existingUser = await UserModel.findOne({email})
            if(existingUser && existingUser._id.toString() !== userId){
                return res.status(409).json({
                    message: "Email already in use",
                    error: true,
                    success: false
                })
            }
        }

        const updateUser = await UserModel.updateOne({ _id: userId },
            updateData
        )

        return res.status(200).json({
            message : "successfully Updated User",
            success: true,
            error : false,
            data: updateUser
        })


    }
    catch(e){
        return res.status(400).json({
            error: true,
            message : "Error Updating User",
        })
    }
}


//Forgot Password Controller
exports.forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }


    const { otp, hashedOtp, expiryTime } = generateOTP(10)

    console.log("Forgot OTP is : " , otp);

     
    user.forgot_password_otp = hashedOtp
    user.forgot_password_expiry = expiryTime

    await user.save();
   
    await sendEmail({
        sendTo: email,
        subject: "Password Reset Verification Code Sent!",
        html : forgotPasswordTemplate({
            name : user.name,
            otp : otp
        })
     })


    

    res.status(200).json({
      message: 'OTP sent to your email',
      success: true,
      error: false
    })
  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: true,
      success: false,
      data: error.message
    })
  }
}

// verify forget pass OTP Controller
exports.verifyForgotPasswordOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check expiry
    if (
      !user.forgot_password_expiry ||
      Date.now() > new Date(user.forgot_password_expiry).getTime()
    ) {
      return res.status(400).json({ message: 'OTP expired' })
    }

    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp.toString())
      .digest('hex')



    if (hashedOtp !== user.forgot_password_otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

     // if  { OTP VERIFIED then =>  ISSUE RESET TOKEN }
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // when otp matched a reset token is saved in db for persistence
    user.forgot_password_otp = hashedResetToken
    user.forgot_password_expiry = Date.now() + 10 * 60 * 1000

    res.cookie('resetToken', resetToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 10 * 60 * 1000
    })

    await user.save()


    res.status(200).json({
      message: 'OTP verified successfully',
      success: true,
      error: false,
      data: { resetToken }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: true,
      success: false,
      data: error.message
    })
  }
}

// Reset Password Controller
exports.resetPasswordController = async (req, res) => {
  try {
    const { newPassword } = req.body
    if(!newPassword){
        return res.status(400).json({
            message: 'New password is required',
            error: true,
            success: false
        })
    }
    const user = req.user // from verifyMiddleware

    user.password = await bcryptjs.hash(newPassword, 10)
    user.forgot_password_otp = null
    user.forgot_password_expiry = null

    await user.save()

   
    res.clearCookie('resetToken')

    res.status(200).json({
      message: 'Password reset successful',
      success: true,
      error: false
    })
  } catch (error) {
    res.status(500).json({
        message: 'Server error',
        error: true,
        success: false
    })
  }
}


exports.accessTokenGenerationController =  async(req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return res.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

    const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return res.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?.userId
        console.log(userId)
        const newAccessToken = await accessTokenGenerate(userId)
        console.log("NEW ACCESS TOKEN :", newAccessToken)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.cookie('accessToken',newAccessToken,cookiesOption)

        return res.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }

}