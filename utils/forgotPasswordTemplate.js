const forgotPasswordTemplate = ({ name, otp })=>{
    return `
<div>
    <p>Dear, ${name}</p>
    <p>Use following OTP code to reset your password.</p>
    <div style="background:yellow; font-size:20px;padding:20px;text-align:center;font-weight : 800;">
        ${otp}
    </div>
    <p>This otp is valid for 10 minutes only.</p>
    <br/>
    </br>
    <p>Thanks</p>
    <p>Ecommerce_samarjit</p>
</div>
    `
}

module.exports = forgotPasswordTemplate