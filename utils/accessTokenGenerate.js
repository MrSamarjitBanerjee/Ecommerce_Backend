const jwt = require('jsonwebtoken')
require('dotenv').config()


// Access Token (short Lived)is Sent with every API request (localStorage)
const accessTokenGenerate = (userId) => {
    const accessToken = jwt.sign(
        { userId: userId },
        process.env.SECRET_KEY_ACCESS_TOKEN, 
        { expiresIn: '24h' })

    return accessToken;
}

module.exports = accessTokenGenerate