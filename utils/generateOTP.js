const crypto = require('crypto')

const generateOTP = (expiryMinutes = 10) => {
  const otp = crypto.randomInt(100000, 999999).toString()
  console.log(otp);

  const hashedOtp = crypto
    .createHash('sha256')
    .update(otp.toString())
    .digest('hex')

  const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000)
  console.log(otp)

  return {
    otp,
    hashedOtp,
    expiryTime
  }
}

module.exports = generateOTP
