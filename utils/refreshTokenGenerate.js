const jwt = require('jsonwebtoken')
const UserModel = require('../models/userModels.js')
require('dotenv').config()

// Refresh Token is longlived () saved in DB
const refreshTokenGenerate = async(userId) => {
    const generatedrefreshToken = jwt.sign(
        { userId: userId },
            process.env.SECRET_KEY_REFRESH_TOKEN, 
            { expiresIn: '30d' })

    if(generatedrefreshToken){
        const userUpdatedRefreshToken = await UserModel.updateOne(
             {_id : userId},
            {refresh_token: generatedrefreshToken}
        )
    }
        
    return generatedrefreshToken;

}

module.exports = refreshTokenGenerate