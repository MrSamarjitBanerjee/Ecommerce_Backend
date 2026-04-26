const multer = require("multer")

const upload = multer({
  storage: multer.memoryStorage(),  // stored in RAM
  limits: { fileSize: 5 * 1024 * 1024 } // 5mb in size
})

module.exports = {upload}

