const Router = require('express') 
const auth = require('../middleware/auth.js')
const admin = require('../middleware/admin.js')
const uploadImageController = require('../controllers/uploadImageController.js')
const {upload} = require('../middleware/multer.js')

const uploadRouter = Router()

uploadRouter.post("/image", auth, admin, upload.single("image"), uploadImageController)

module.exports =  uploadRouter
