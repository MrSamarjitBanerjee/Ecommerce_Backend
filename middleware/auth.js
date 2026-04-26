require("dotenv").config()
const jwt = require("jsonwebtoken")


const auth = (req, res, next) => {
    console.log("Cookies:", req.cookies)
    console.log("AccessToken:", req.cookies?.accessToken)

    try {
        
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1]; // Bearer <

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                success: false,
                error: true
            })
        }

        
        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY_ACCESS_TOKEN
        )
        console.log("Decoded:", decoded)
      
        req.userId = decoded.userId   
        req.user = decoded            

        
        next()

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
            error: true
        })
    }
}

module.exports = auth
