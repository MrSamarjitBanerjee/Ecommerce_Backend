const cloudinary = require("../config/cloudinaryConfig")

const uploadImageToCloudinary = async (file, folder = "Ecommerce_images") => {
  
  const buffer =
    file.buffer ||
    Buffer.from(await file.arrayBuffer())

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",     
        format: "webp",              
        quality: "auto",             
        fetch_format: "auto"
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    ).end(buffer)
  })
}

module.exports = {uploadImageToCloudinary}
