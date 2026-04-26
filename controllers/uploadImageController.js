const {uploadImageToCloudinary} = require("../utils/uploadImageCloudinary")

const uploadImageController = async(req,res)=>{
    try {
        const file = req.file

        const uploadImage = await uploadImageToCloudinary(file)

        return res.json({
            message : "Upload done",
            data : {
                url: uploadImage.secure_url,
                public_id: uploadImage.public_id
            },
            success : true,
            error : false
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

module.exports =  uploadImageController